import test from 'ava';
const sut = require('../');

const apiHost = 'http://localhost:4103/applications/i18n/phrases';

test('Init should load from api', async (t) => {
  await sut.init(apiHost).then((dictionary) => {
    t.pass('i18n loaded');
  }, (err) => {
    t.fail(err);
  });
});

test('Should get multiple times', async (t) => {
  await sut.init(apiHost, 'no').then((dictionary) => {
    t.is(sut.get('test'), 'testttt');
    t.is(sut.get('aaa'), 'bb');
  }, (err) => {
    t.fail(err);
  });
});

test('Should return key when no match', async (t) => {
  await sut.init(apiHost, 'no').then((dictionary) => {
    t.is(sut.get('i dont exist'), 'i dont exist');
  }, (err) => {
    t.fail(err);
  });
});

test('Should get undefined if key misses for language', async (t) => {
  await sut.init(apiHost, 'bamse').then((dictionary) => {
    t.is(sut.get('test'), 'test');
  }, (err) => {
    t.fail(err);
  });
});

test('Should return all when no default language set', async (t) => {
  await sut.init(apiHost).then((dictionary) => {
    t.is(sut.get('test').no,  'testttt');
    t.is(sut.get('test').en,  'tttt');
  }, (err) => {
    t.fail(err);
  });
});
