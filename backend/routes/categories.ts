import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { Category } from '../models/category';

const router = Router();
const dbPath = './backend/db.json';

const readDatabase = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDatabase = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Получить список всех категорий
router.get('/', (req, res) => {
    const db = readDatabase();
    const categories = db.categories.map((category: Category) => ({ id: category.id, name: category.name }));
    res.json(categories);
});

// Получить категорию по ID
router.get('/:id', (req, res) => {
    const db = readDatabase();
    const category = db.categories.find((c: Category) => c.id === req.params.id);
    if (category) {
        res.json(category);
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

router.post('/', (req, res) => {
    const db = readDatabase();
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const newCategory: Category = {
        id: uuidv4(),
        name,
        description,
    };

    db.categories.push(newCategory);
    writeDatabase(db);
    res.status(201).json(newCategory);
});

router.delete('/:id', (req, res) => {
    const db = readDatabase();
    const categoryIndex = db.categories.findIndex((c: Category) => c.id === req.params.id);

    if (categoryIndex === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }

    const hasRelatedItems = db.items.some((item: any) => item.categoryId === req.params.id);
    if (hasRelatedItems) {
        return res.status(400).json({ message: 'Category has related items and cannot be deleted' });
    }

    db.categories.splice(categoryIndex, 1);
    writeDatabase(db);
    res.status(204).end();
});

export default router;
