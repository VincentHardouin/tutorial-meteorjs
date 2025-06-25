import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';

const SEED_USERNAME = 'meteorite';
const SEED_PASSWORD = 'password';

const insertTask = (taskText,user) => {
  TasksCollection.insertAsync({
    text: taskText,
    userId: user._id,
    createdAt: new Date(),
  });
};

Meteor.startup(async () => {
  if (!(await Accounts.findUserByUsername(SEED_USERNAME))) {
    await Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }

  const user = await Accounts.findUserByUsername(SEED_USERNAME);

  if ((await TasksCollection.find().countAsync()) === 0) {
    [
      'First Task',
      'Second Task',
      'Third Task',
      'Fourth Task',
      'Fifth Task',
      'Sixth Task',
      'Seventh Task'
    ].forEach((task) => insertTask(task, user))
  }
});