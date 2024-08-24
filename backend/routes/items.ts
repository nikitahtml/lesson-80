import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { Item } from '../models/item';

const router = Router();
const dbPath = './backend/db.json';

const readDatabase = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDatabase = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
    const db = readDatabase();
    const items = db.items.map((item: Item) => ({ id: item.id, name: item.name }));
    res.json(items);
});

router.get('/:id', (req, res) => {
    const db = readDatabase();
    const item = db.items.find((i: Item) => i.id === req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});


router.post('/', (req, res) => {
    const db = readDatabase();
    const { categoryId, locationId, name, description, photo } = req.body;

    if (!categoryId || !locationId || !name) {
        return res.status(400).json({ message: 'Category ID, Location ID, and Name are required' });
    }

    const newItem: Item = {
        id: uuidv4(),
        categoryId,
        locationId,
        name,
        description,
        photo,
        inventoryDate: new Date().toISOString(),
    };

    db.items.push(newItem);
    writeDatabase(db);
    res.status(201).json(newItem);
});


router.delete('/:id', (req, res) => {
    const db = readDatabase();
    const itemIndex = db.items.findIndex((i: Item) => i.id === req.params.id);

    if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    db.items.splice(itemIndex, 1);
    writeDatabase(db);
    res.status(204).end();
});

export default router;
