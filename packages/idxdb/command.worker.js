self.onmessage = async ({ data }) => {
  console.time('command worker');
  try {
    if (!data) throw new Error('No data');

    const { IndexedDbContext } = await import('./idx.db.js');
    const { dbContextConfig, operation, post } = data;
    const { DB_NAME, OBJECT_STORES, DB_OPERATIONS } = dbContextConfig;
    const dbContext = await IndexedDbContext.init({
      dbName: DB_NAME,
      stores: [
        {
          name: OBJECT_STORES.USERS,
          options: IndexedDbContext.OBJECT_STORE_OPTIONS.keyPath('id'),
        },
        {
          name: OBJECT_STORES.CREDENTIALS,
          options: IndexedDbContext.OBJECT_STORE_OPTIONS.keyPath('id'),
        },
      ],
    });

    if (operation === DB_OPERATIONS.CREATE) {
      const id = crypto.randomUUID();
      const usersResult = dbContext
        .store({ name: OBJECT_STORES.USERS })
        .create({ id, name: post.name });
      const credentialsResult = dbContext
        .store({ name: OBJECT_STORES.CREDENTIALS })
        .create({ id, password: post.password });
      await Promise.all([usersResult, credentialsResult]);
      self.postMessage({ done: true, id });
    }
  } catch (error) {
    self.postMessage({ done: false, error });
    console.error(error);
  }
  console.timeEnd('command worker');
};
