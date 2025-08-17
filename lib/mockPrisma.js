// Mock Database for Testing
const mockDatabase = {
  users: [
    { id: '1', name: 'مستخدم تجريبي', email: 'test@example.com' },
    { id: '2', name: 'محمد أحمد', email: 'mohamed@example.com' }
  ],
  articles: [
    { id: '1', title: 'مقال تجريبي', content: 'محتوى تجريبي', likes: 5, saves: 3, shares: 2 },
    { id: '2', title: 'أخبار اليوم', content: 'آخر الأخبار', likes: 10, saves: 7, shares: 5 }
  ],
  interactions: [
    { id: '1', user_id: '1', article_id: '1', type: 'like' },
    { id: '2', user_id: '1', article_id: '1', type: 'save' },
    { id: '3', user_id: '2', article_id: '2', type: 'like' }
  ]
};

class MockPrisma {
  constructor() {
    this.mockData = mockDatabase;
  }

  async $connect() {
    console.log('✅ Mock Database Connected');
    return Promise.resolve();
  }

  async $disconnect() {
    console.log('🔌 Mock Database Disconnected');
    return Promise.resolve();
  }

  users = {
    count: async () => this.mockData.users.length,
    findMany: async () => this.mockData.users,
    findUnique: async ({ where }) => {
      return this.mockData.users.find(user => user.id === where.id) || null;
    }
  };

  articles = {
    count: async () => this.mockData.articles.length,
    findMany: async () => this.mockData.articles,
    findUnique: async ({ where }) => {
      return this.mockData.articles.find(article => article.id === where.id) || null;
    },
    update: async ({ where, data }) => {
      const article = this.mockData.articles.find(a => a.id === where.id);
      if (article) {
        Object.assign(article, data);
      }
      return article;
    }
  };

  interactions = {
    count: async () => this.mockData.interactions.length,
    findMany: async ({ where = {} }) => {
      let results = this.mockData.interactions;
      
      if (where.user_id) {
        results = results.filter(i => i.user_id === where.user_id);
      }
      
      if (where.article_id) {
        if (where.article_id.in) {
          results = results.filter(i => where.article_id.in.includes(i.article_id));
        } else {
          results = results.filter(i => i.article_id === where.article_id);
        }
      }
      
      if (where.type) {
        results = results.filter(i => i.type === where.type);
      }
      
      return results;
    },
    findFirst: async ({ where }) => {
      return this.mockData.interactions.find(i => 
        i.user_id === where.user_id && 
        i.article_id === where.article_id && 
        i.type === where.type
      ) || null;
    },
    create: async ({ data }) => {
      const newInteraction = { ...data };
      this.mockData.interactions.push(newInteraction);
      console.log('✅ Mock Interaction Created:', newInteraction);
      return newInteraction;
    },
    delete: async ({ where }) => {
      const index = this.mockData.interactions.findIndex(i => i.id === where.id);
      if (index > -1) {
        const deleted = this.mockData.interactions.splice(index, 1)[0];
        console.log('🗑️ Mock Interaction Deleted:', deleted);
        return deleted;
      }
      return null;
    },
    deleteMany: async ({ where }) => {
      const initialCount = this.mockData.interactions.length;
      this.mockData.interactions = this.mockData.interactions.filter(i => {
        let keep = true;
        if (where.user_id) keep = keep && i.user_id !== where.user_id;
        if (where.article_id) keep = keep && i.article_id !== where.article_id;
        return keep;
      });
      const deletedCount = initialCount - this.mockData.interactions.length;
      console.log(`🗑️ Mock Interactions Deleted: ${deletedCount}`);
      return { count: deletedCount };
    }
  };

  $transaction = async (callback) => {
    return await callback(this);
  };
}

module.exports = { MockPrisma, mockDatabase };
