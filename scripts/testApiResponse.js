import axios from 'axios';

async function testApi() {
    try {
        const response = await axios.get('http://localhost:5000/api/categories');
        const categories = response.data.categories || [];
        console.log('--- API Response Categories ---');
        categories.forEach(c => {
            console.log(`- Name: ${c.name}, showInNavbar: ${c.showInNavbar}, Order: ${c.order}`);
        });
    } catch (err) {
        console.error('API call failed. Make sure the server is running on port 5000.');
    }
}

testApi();
