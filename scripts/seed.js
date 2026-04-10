import mongoose from 'mongoose';
import TaskTemplate from '../src/models/TaskTemplate/index.ts';
import DayTemplate from '../src/models/DayTemplate.ts';
    
async function seed() {
  try {
    const connect = await mongoose.connect('mongodb+srv://TestUser:TestUser@cluster0.f42jk.mongodb.net/mylo');
    console.log(`✅ Connected to MongoDB at: ${mongoose.connection.name}`);
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    // Verify connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Collections in DB: ${collections.map((c) => c.name).join(', ') || 'None'}`);
    console.log('Connected to MongoDB');

    await TaskTemplate.deleteMany({});
    await DayTemplate.deleteMany({});
    console.log('Cleared existing data');

    await DayTemplate.create({
      type: 'monday',
      name: 'Monday Standard',
      activeDays: [1],
      slots: [
        { name: 'Work', start: '09:00', end: '17:00', type: 'slot' },
        { name: 'Commute', start: '08:00', end: '09:00', type: 'context' }
      ],
      contexts: [
        { name: 'Commute', start: '08:00', end: '09:00', type: 'context' }
      ]
    });

    await TaskTemplate.create({
      type: 'brush_teeth',
      name: 'Brush Teeth',
      duration: 5,
      recurrence: 'daily',
      slotType: 'slot',
      contextType: 'context',
      slotPriority: 5,
      contextPriority: 5,
      projectPriority: 0
    });

    await TaskTemplate.create({
      type: 'deep_work',
      name: 'Deep Work',
      duration: 60,
      recurrence: 'daily',
      slotType: 'slot',
      slotPriority: 10,
      contextPriority: 0,
      projectPriority: 8
    });

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
