import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { autoSaveService } from '@/lib/services/AutoSaveService';

// Mock the AutoSaveService
jest.mock('@/lib/services/AutoSaveService', () => ({
  autoSaveService: {
    register: jest.fn(),
    unregister: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    markAsChanged: jest.fn(),
    getVersions: jest.fn(),
    detectConflicts: jest.fn(),
    resolveConflict: jest.fn(),
    getState: jest.fn(),
    addListener: jest.fn(() => jest.fn()), // إرجاع دالة unsubscribe
  }
}));

const mockAutoSaveService = autoSaveService as jest.Mocked<typeof autoSaveService>;

describe('useAutoSave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // إعداد القيم الافتراضية للـ mocks
    mockAutoSaveService.getState.mockReturnValue({
      isEnabled: true,
      lastSaved: null,
      isSaving: false,
      hasUnsavedChanges: false,
      versions: [],
      currentVersion: null,
      conflicts: []
    });
    
    mockAutoSaveService.getVersions.mockReturnValue([]);
    mockAutoSaveService.detectConflicts.mockResolvedValue([]);
    mockAutoSaveService.save.mockResolvedValue();
    mockAutoSaveService.restore.mockResolvedValue({ text: 'restored content' });
    mockAutoSaveService.resolveConflict.mockResolvedValue();
  });

  it('يسجل التكوين عند التهيئة', () => {
    renderHook(() => useAutoSave({
      key: 'test-editor',
      interval: 30000,
      maxVersions: 10
    }));

    expect(mockAutoSaveService.register).toHaveBeenCalledWith({
      key: 'test-editor',
      interval: 30000,
      maxVersions: 10,
      enableCloudSync: false,
      enableConflictResolution: true,
      compressionEnabled: false
    });
  });

  it('يلغي التسجيل عند الإلغاء', () => {
    const { unmount } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    unmount();

    expect(mockAutoSaveService.unregister).toHaveBeenCalledWith('test-editor');
  });

  it('يحفظ المحتوى', async () => {
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    const content = { text: 'test content' };

    await act(async () => {
      await result.current.save(content);
    });

    expect(mockAutoSaveService.save).toHaveBeenCalledWith('test-editor', content, false);
  });

  it('يحفظ المحتوى بالإجبار', async () => {
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    const content = { text: 'test content' };

    await act(async () => {
      await result.current.save(content, true);
    });

    expect(mockAutoSaveService.save).toHaveBeenCalledWith('test-editor', content, true);
  });

  it('يستعيد المحتوى', async () => {
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    let restoredContent;

    await act(async () => {
      restoredContent = await result.current.restore();
    });

    expect(mockAutoSaveService.restore).toHaveBeenCalledWith('test-editor', undefined);
    expect(restoredContent).toEqual({ text: 'restored content' });
  });

  it('يستعيد نسخة محددة', async () => {
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    await act(async () => {
      await result.current.restore('version-123');
    });

    expect(mockAutoSaveService.restore).toHaveBeenCalledWith('test-editor', 'version-123');
  });

  it('يميز المحتوى كمتغير', () => {
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    act(() => {
      result.current.markAsChanged();
    });

    expect(mockAutoSaveService.markAsChanged).toHaveBeenCalledWith('test-editor');
  });

  it('يكتشف التضارب', async () => {
    const mockConflicts = [
      {
        id: 'conflict-1',
        timestamp: new Date(),
        content: { text: 'conflict content' },
        contentHash: 'hash1',
        size: 100,
        metadata: {
          editorType: 'test',
          sessionId: 'session1',
          deviceInfo: 'device1'
        }
      }
    ];

    mockAutoSaveService.detectConflicts.mockResolvedValue(mockConflicts);

    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    let conflicts;

    await act(async () => {
      conflicts = await result.current.detectConflicts();
    });

    expect(mockAutoSaveService.detectConflicts).toHaveBeenCalledWith('test-editor');
    expect(conflicts).toEqual(mockConflicts);
  });

  it('يحل التضارب', async () => {
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    await act(async () => {
      await result.current.resolveConflict('version-123', 'keep');
    });

    expect(mockAutoSaveService.resolveConflict).toHaveBeenCalledWith('test-editor', 'version-123', 'keep');
  });

  it('يستدعي onSave callback', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor',
      onSave
    }));

    const content = { text: 'test content' };

    await act(async () => {
      await result.current.save(content);
    });

    expect(onSave).toHaveBeenCalledWith(content);
  });

  it('يستدعي onRestore callback', async () => {
    const onRestore = jest.fn();
    
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor',
      onRestore
    }));

    await act(async () => {
      await result.current.restore();
    });

    expect(onRestore).toHaveBeenCalledWith({ text: 'restored content' });
  });

  it('يستدعي onError callback عند حدوث خطأ', async () => {
    const onError = jest.fn();
    const error = new Error('Save failed');
    
    mockAutoSaveService.save.mockRejectedValue(error);
    
    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor',
      onError
    }));

    await act(async () => {
      try {
        await result.current.save({ text: 'test' });
      } catch (e) {
        // متوقع
      }
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('يحدث الحالة عند تغيير البيانات', () => {
    const mockState = {
      isEnabled: true,
      lastSaved: new Date(),
      isSaving: false,
      hasUnsavedChanges: true,
      versions: [
        {
          id: 'version-1',
          timestamp: new Date(),
          content: { text: 'content' },
          contentHash: 'hash',
          size: 100,
          metadata: {
            editorType: 'test',
            sessionId: 'session',
            deviceInfo: 'device'
          }
        }
      ],
      currentVersion: null,
      conflicts: []
    };

    mockAutoSaveService.getState.mockReturnValue(mockState);

    const { result } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    expect(result.current.state).toEqual(mockState);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.versions).toHaveLength(1);
  });

  it('يفعل ويعطل الحفظ التلقائي', () => {
    const mockState = {
      isEnabled: false,
      lastSaved: null,
      isSaving: false,
      hasUnsavedChanges: false,
      versions: [],
      currentVersion: null,
      conflicts: []
    };

    mockAutoSaveService.getState.mockReturnValue(mockState);

    const { result, rerender } = renderHook(() => useAutoSave({
      key: 'test-editor'
    }));

    expect(result.current.isEnabled).toBe(false);

    act(() => {
      result.current.enable();
    });

    // محاكاة تغيير الحالة
    mockState.isEnabled = true;
    rerender();

    expect(result.current.isEnabled).toBe(true);

    act(() => {
      result.current.disable();
    });

    // محاكاة تغيير الحالة
    mockState.isEnabled = false;
    rerender();

    expect(result.current.isEnabled).toBe(false);
  });
});