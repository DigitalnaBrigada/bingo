require('dotenv').config();
const {app, BrowserWindow, ipcMain} = require('electron/main');
const path = require('node:path');

// supabase
const {createClient} = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('index.html');
}
app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong');
    createWindow();

    // macOS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('get-age-groups', async () => {
    const {data, error} = await supabase.from('AgeGroups').select('*');
    if (error) return {error: error.message};
    return data;
});

/**
 * loadMenu
 * Returns all AgeGroups and Categories
 */
ipcMain.handle('loadMenu', async () => {
    try {
        const [{data: ageGroups, error: ageErr}, {data: categories, error: catErr}] = await Promise.all([
            supabase.from('AgeGroups').select('*').order('min_age', {ascending: true}),
            supabase.from('Category').select('*').order('name', {ascending: true}),
        ]);

        if (ageErr) throw ageErr;
        if (catErr) throw catErr;

        return {ageGroups, categories};
    } catch (err) {
        return {error: err.message};
    }
});


/**
 * leaderboard
 * Params: { groups: number[], categories: number[] }
 * Returns: list of leaderboard entries joined with User info
 */
ipcMain.handle('leaderboard', async (event, {groups, categories}) => {
    try {
        const {data, error} = await supabase
            .from('Leaderboard')
            .select(`
                id,
                score,
                created_at,
                age_group_id,
                user_id,
                category_id
                User ( first_name, last_name )
            `)
            .in('age_group_id', groups)
            .in('category_id', categories)
            .order('score', {ascending: false});

        if (error) throw error;

        return data;
    } catch (err) {
        return {error: err.message};
    }
});


/**
 * startGame
 * Params: { group: number, categories: number[] }
 * Returns: questions for that age group & any of the categories,
 *           excluding the correct_answer field.
 */
ipcMain.handle('startGame', async (event, {group, categories}) => {
    try {
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('categories must be a non-empty array');
        }

        const {data, error} = await supabase
            .from('Questions')
            .select('id, text, answers, image_path, category_id')
            .eq('age_group_id', group)
            .in('category_id', categories);

        if (error) throw error;

        const questions = data.map((q) => ({
            id: q.id,
            text: q.text,
            options: q.answers,
            image_path: q.image_path,
            category_id: q.category_id,
        }));

        return questions;
    } catch (err) {
        return {error: err.message};
    }
});


/**
 * answer
 * Params: { questionId: number, selectedIndex: number }
 * Returns: { correct: boolean }
 */
ipcMain.handle('answer', async (event, {questionId, selectedIndex}) => {
    try {
        const {data, error} = await supabase
            .from('Questions')
            .select('correct_answer')
            .eq('id', questionId)
            .single();

        if (error) throw error;

        const correct = data.correct_answer === selectedIndex;
        return {correct};
    } catch (err) {
        return {error: err.message};
    }
});