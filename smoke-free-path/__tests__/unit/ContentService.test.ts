import {
  getLibraryByTopic,
  getDuasByCategory,
  getStepContent,
  getAllIslamicContent,
  getIslamicContentById,
  getRelatedContent
} from '../../services/ContentService';

// Mock the data imports
// Note: ContentService uses require('../assets/data/...')
// We mock these paths relative to the service file or as they are required.
jest.mock('../../assets/data/islamic_content.json', () => [
  { id: 'ic_001', topic: 'tawakkul', stepAssignment: 1, relatedContentIds: ['ic_002'] },
  { id: 'ic_002', topic: 'tawakkul', stepAssignment: 2, relatedContentIds: ['ic_001'] },
  { id: 'ic_003', topic: 'sabr', stepAssignment: 3, relatedContentIds: [] },
], { virtual: true });

jest.mock('../../assets/data/duas.json', () => [
  { id: 'dua_001', duaCategory: 'morning_adhkar' },
  { id: 'dua_002', duaCategory: 'evening_adhkar' },
], { virtual: true });

jest.mock('../../assets/data/step_plans.json', () => [], { virtual: true });
jest.mock('../../assets/data/milestones.json', () => [], { virtual: true });
jest.mock('../../assets/data/health_timeline.json', () => [], { virtual: true });

describe('ContentService', () => {
  describe('getLibraryByTopic', () => {
    it('should return content matching the given topic', () => {
      const results = getLibraryByTopic('tawakkul' as any);
      expect(results).toHaveLength(2);
      expect(results.every(item => item.topic === 'tawakkul')).toBe(true);
      expect(results.map(r => r.id)).toContain('ic_001');
      expect(results.map(r => r.id)).toContain('ic_002');
    });

    it('should return an empty array if no content matches the topic', () => {
      const results = getLibraryByTopic('health' as any);
      expect(results).toHaveLength(0);
    });
  });

  describe('getDuasByCategory', () => {
    it('should return duas matching the given category', () => {
      const results = getDuasByCategory('morning_adhkar' as any);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('dua_001');
    });

    it('should return an empty array if no duas match the category', () => {
      const results = getDuasByCategory('shukr_dua' as any);
      expect(results).toHaveLength(0);
    });
  });

  describe('getStepContent', () => {
    it('should return content for a specific step', () => {
      const result = getStepContent(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe('ic_001');
    });

    it('should return null if no content is assigned to the step', () => {
      const result = getStepContent(99);
      expect(result).toBeNull();
    });
  });

  describe('getAllIslamicContent', () => {
    it('should return all islamic content items', () => {
      const results = getAllIslamicContent();
      expect(results).toHaveLength(3);
    });
  });

  describe('getIslamicContentById', () => {
    it('should return content from islamic_content.json if ID matches', () => {
      const result = getIslamicContentById('ic_001');
      expect(result?.id).toBe('ic_001');
    });

    it('should return content from duas.json if ID matches', () => {
      const result = getIslamicContentById('dua_001');
      expect(result?.id).toBe('dua_001');
    });

    it('should return null if ID is not found', () => {
      const result = getIslamicContentById('non_existent_id');
      expect(result).toBeNull();
    });
  });

  describe('getRelatedContent', () => {
    it('should return related content items', () => {
      const results = getRelatedContent('ic_001');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('ic_002');
    });

    it('should return an empty array if content has no related items', () => {
      const results = getRelatedContent('ic_003');
      expect(results).toHaveLength(0);
    });

    it('should return an empty array if content ID is not found', () => {
      const results = getRelatedContent('non_existent_id');
      expect(results).toHaveLength(0);
    });
  });
});
