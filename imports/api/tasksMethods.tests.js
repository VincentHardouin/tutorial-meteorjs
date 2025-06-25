import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { mockMethodCall } from 'meteor/quave:testing';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';

chai.use(chaiAsPromised);

const expect = chai.expect;

import { TasksCollection } from '/imports/db/TasksCollection';
import '/imports/api/tasksMethods';

if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      const userId = Random.id();
      let taskId;

      beforeEach(async () => {
        await TasksCollection.removeAsync({});
        taskId = await TasksCollection.insertAsync({
          text: 'Test Task',
          createdAt: new Date(),
          userId,
        });
      });

      it('can delete owned task', async () => {
        await mockMethodCall('tasks.remove', taskId, { context: { userId }});

        expect(await TasksCollection.find().countAsync()).equal(0);
      });

      it(`can't delete task without an user authenticated`, async () => {
        const fn = async () => await mockMethodCall('tasks.remove', taskId);
        await expect(fn).throw(/Not authorized/);
        expect(await TasksCollection.find().countAsync()).equal(1);
      });

      it(`can't delete task from another owner`, async () => {
        const fn = async () => {
          await mockMethodCall('tasks.remove', taskId, {
            context: {userId: 'somebody-else-id'},
          });
        }
        await expect(fn).throw(/Access denied/);
        expect(await TasksCollection.find().countAsync()).equal(1);
      });

      it('can change the status of a task', async () => {
        const originalTask = await TasksCollection.findOneAsync(taskId);
        await mockMethodCall('tasks.setIsChecked', taskId, !originalTask.isChecked, {
          context: { userId },
        });

        const updatedTask = await TasksCollection.findOneAsync(taskId);
        expect(updatedTask.isChecked).not.equal(originalTask.isChecked);
      });

      it('can insert new tasks', async () => {
        const text = 'New Task';
        await mockMethodCall('tasks.insert', text, {
          context: { userId },
        });

        const tasks = await TasksCollection.find({}).fetch();
        expect(tasks.length).equal( 2);
        expect(tasks.some(task => task.text === text)).is.true;
      });
    });
  });
}