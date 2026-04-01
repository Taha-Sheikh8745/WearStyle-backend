import axios from 'axios';

async function testCreate() {
    try {
        console.log('Testing category creation with showInNavbar...');
        // We need an admin token, but as a shortcut, we can check the controller logic again
        // or just try to see if the server logs it.
        // Since I can't easily get a token without login, I'll check the controller once more.
    } catch (err) {
        console.error('Test failed');
    }
}

testCreate();
