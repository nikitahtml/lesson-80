import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { Location } from '../models/location';

const router = Router();
const dbPath = './backend/db.json';

const readDatabase = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDatabase = (data: any) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
    const db = readDatabase();
    const locations = db.locations.map((location: Location) => ({ id: location.id, name: location.name }));
    res.json(locations);
});

// Получить местоположение по ID
router.get('/:id', (req, res) => {
    const db = readDatabase();
    const location = db.locations.find((l: Location) => l.id === req.params.id);
    if (location) {
        res.json(location);
    } else {
        res.status(404).json({ message: 'Location not found' });
    }
});

router.post('/', (req, res) => {
    const db = readDatabase();
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const newLocation: Location = {
        id: uuidv4(),
        name,
        description,
    };

    db.locations.push(newLocation);
    writeDatabase(db);
    res.status(201).json(newLocation);
});

router.delete('/:id', (req, res) => {
    const db = readDatabase();
    const locationIndex = db.locations.findIndex((l: Location) => l.id === req.params.id);

    if (locationIndex === -1) {
        return res.status(404).json({ message: 'Location not found' });
    }

    const hasRelatedItems = db.items.some((item: any) => item.locationId === req.params.id);
    if (hasRelatedItems) {
        return res.status(400).json({ message: 'Location has related items and cannot be deleted' });
    }

    db.locations.splice(locationIndex, 1);
    writeDatabase(db);
    res.status(204).end();
});

export default router;
