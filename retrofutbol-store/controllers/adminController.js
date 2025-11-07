const fs = require('fs');
const path = require('path');
const shirtsPath = path.join(__dirname, '../data/shirts.json');

const getShirts = () => {
    return JSON.parse(fs.readFileSync(shirtsPath, 'utf-8'));
};

const saveShirts = (shirts) => {
    fs.writeFileSync(shirtsPath, JSON.stringify(shirts, null, 2));
};

exports.listShirts = (req, res) => {
    const shirts = getShirts();
    res.render('admin', { shirts });
};

exports.showAddForm = (req, res) => {
    res.render('add_shirt');
};

exports.addShirt = (req, res) => {
    const shirts = getShirts();
    const { id, team, year, price, image, description, video, map, sizes } = req.body;
    
    // Aquí, `sizes` ya es un arreglo de objetos gracias a la nueva estructura del formulario
    const newShirt = {
        id: parseInt(id),
        team,
        year: parseInt(year),
        price: parseFloat(price),
        image,
        description,
        video,
        map,
        sizes
    };
    
    shirts.push(newShirt);
    saveShirts(shirts);

    res.redirect('/admin');
};

exports.showEditForm = (req, res) => {
    const shirts = getShirts();
    const shirt = shirts.find(s => s.id === parseInt(req.params.id));
    if (!shirt) {
        return res.status(404).send('Camiseta no encontrada');
    }
    res.render('edit_shirt', { shirt });
};

exports.updateShirt = (req, res) => {
    const shirts = getShirts();
    const { id, team, year, price, image, description, video, map, sizes } = req.body;
    const shirtIndex = shirts.findIndex(s => s.id === parseInt(req.params.id));

    if (shirtIndex === -1) {
        return res.status(404).send('Camiseta no encontrada');
    }

    const updatedShirt = {
        id: parseInt(id),
        team,
        year: parseInt(year),
        price: parseFloat(price),
        image,
        description,
        video,
        map,
        sizes
    };

    shirts[shirtIndex] = updatedShirt;
    saveShirts(shirts);
    res.redirect('/admin');
};

exports.deleteShirt = (req, res) => {
    const shirts = getShirts();
    const newShirts = shirts.filter(s => s.id !== parseInt(req.params.id));
    saveShirts(newShirts);
    res.redirect('/admin');
};