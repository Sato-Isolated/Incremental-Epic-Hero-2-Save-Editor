const container = document.getElementById('jsoneditor');
const options = {
    mode: 'tree',
    modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
};
const editor = new JSONEditor(container, options);

document.getElementById('pasteButton').addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('input').value = text;
    } catch (err) {
        alert('Failed to read clipboard contents: ' + err);
    }
});

class AES {
    constructor() {
        this.pw = 'kkyyhka';
        this.salt = 'stkttnsstkttns';
        this.iterations = 1000;
    }

    getKeyAndIV() {
        const keySize = 128 / 32;
        const ivSize = 128 / 32;
        const salt = CryptoJS.enc.Utf8.parse(this.salt);
        const key = CryptoJS.PBKDF2(this.pw, salt, {
            keySize: keySize + ivSize,
            iterations: this.iterations
        });

        return {
            key: CryptoJS.lib.WordArray.create(key.words.slice(0, keySize)),
            iv: CryptoJS.lib.WordArray.create(key.words.slice(keySize, keySize + ivSize))
        };
    }

    encrypt(src) {
        const { key, iv } = this.getKeyAndIV();
        const encrypted = CryptoJS.AES.encrypt(src, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        return encrypted.toString();
    }

    decrypt(src) {
        const { key, iv } = this.getKeyAndIV();
        const decrypted = CryptoJS.AES.decrypt(src, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}



document.getElementById('decryptButton').addEventListener('click', () => {
    const input = document.getElementById('input').value;
    const aes = new AES();
    try {
        const output = aes.decrypt(input);
        editor.set(JSON.parse(output));
    } catch (err) {
        alert('Decryption error: ' + err.message);
    }
});

document.getElementById('encryptButton').addEventListener('click', () => {
    const json = editor.get();
    const jsonString = JSON.stringify(json);
    const aes = new AES();
    try {
        const output = aes.encrypt(jsonString);
        document.getElementById('output').value = output;
    } catch (err) {
        alert('Encryption error: ' + err.message);
    }
});

document.getElementById('copyButton').addEventListener('click', () => {
    const output = document.getElementById('output').value;
    navigator.clipboard.writeText(output).then(() => {
        alert('Copied to clipboard');
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
});

// Toggle dark mode
const toggleThemeButton = document.getElementById('toggleTheme');
toggleThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    toggleThemeButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Set initial icon based on the mode
const isDarkMode = document.body.classList.contains('dark-mode');
toggleThemeButton.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';


document.addEventListener('DOMContentLoaded', async () => {
    const repo = 'Sato-Isolated/Incremental-Epic-Hero-2-Save-Editor';
    const apiUrl = `https://api.github.com/repos/${repo}?t=${new Date().getTime()}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }

        const repoData = await response.json();

        // Update stars, forks, and issues in the DOM
        document.getElementById('githubStars').textContent = repoData.stargazers_count;
        document.getElementById('githubForks').textContent = repoData.forks_count;
        document.getElementById('githubIssues').textContent = repoData.open_issues_count;
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
    }
});
