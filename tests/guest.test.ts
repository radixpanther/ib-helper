import Helper from '../';

let helper: Helper;
beforeAll(() => {
  helper = new Helper();
});
afterAll(() => {
  if (helper.sid) helper.logout();
});

describe('Guest Mode', () => {
  it('login', async () => {
    // Mock console.warn()
    const originalWarn = console.warn;
    const consoleLog = [] as string[];
    console.warn = (output: string) => consoleLog.push(output);

    const res = await helper.login();
    expect(res.sid.length).toBeGreaterThan(0);
    expect(consoleLog).toContain(
      'Using the API as guest user can be significantly slower! Use proper credentials instead!'
    );

    // Restore console.warn()
    console.warn = originalWarn;
  });

  it('update rating', async () => {
    const res = await helper.rating({
      nudity: true,
      sexualThemes: true,
      strongViolence: true,
      violence: true,
    });
    expect(res).toMatchObject({ sid: helper.sid });
  });

  it('search with tags', async () => {
    const res = await helper.searchTags(['the_lion_king'], false, 1, 10);
    expect(res).toMatchObject({
      sid: helper.sid,
      page: 1,
    });
    expect(res.submissions.length).toBe(10);
    expect(typeof res.nextPage).toBe('function');
    expect(typeof res.previousPage).toBe('function');
  });
});
