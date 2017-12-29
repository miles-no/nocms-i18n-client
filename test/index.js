const test = require('tape');
const sut = require('../');

const apiHost = 'http://localhost:4103/applications/i18n/phrases';

const tearDown = () => {
  sut.stopRefresh();
};

test('Should get phrases from i18n api', (t) => {
  t.plan(1);
  sut.init(apiHost).then((dictionary) => {
    console.log('param', dictionary);
    console.log('get', sut.get());
    t.pass('i18n loaded');
  }, (err) => {
    console.log('err', err);
    t.fail('Couldn\'t get i18n  ');
  });
});

test('Should get multiple times', (t) => {
  t.plan(1);
  sut.init(apiHost).then((dictionary) => {
    console.log('get test', sut.get('test'));
    console.log('get aaa', sut.get('aaa'));
    t.pass('i18n loaded');
  }, (err) => {
    console.log('err', err);
    t.fail('Couldn\'t get i18n  ');
  });
});

test('teardown', (t) => {
  tearDown();
  t.end();
});
