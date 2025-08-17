/**
 * نظام السمات التكيفية - API Endpoints
 * Adaptive Themes API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { adaptiveThemesService } from '../../../lib/modules/adaptive-themes/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_all_themes';

    switch (action) {
      case 'get_all_themes':
        const themes = await adaptiveThemesService.get_all_themes();
        return NextResponse.json({ success: true, data: themes });

      case 'get_theme':
        const themeId = searchParams.get('id');
        if (!themeId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
        }
        
        const theme = await adaptiveThemesService.get_theme_by_id(themeId);
        if (!theme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: theme });

      case 'get_active_theme':
        const activeTheme = await adaptiveThemesService.get_active_theme();
        return NextResponse.json({ success: true, data: activeTheme });

      case 'preview_theme':
        const previewId = searchParams.get('id');
        const device = searchParams.get('device') as any;
        
        if (!previewId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for preview' }, { status: 400 });
        }
        
        const previewOptions = device ? { device } : undefined;
        const preview = await adaptiveThemesService.preview_theme(previewId, previewOptions);
        return NextResponse.json({ success: true, data: preview });

      case 'validate_theme':
        const validateId = searchParams.get('id');
        if (!validateId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for validation' }, { status: 400 });
        }
        
        const themeToValidate = await adaptiveThemesService.get_theme_by_id(validateId);
        if (!themeToValidate) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const validation = await adaptiveThemesService.validate_theme(themeToValidate);
        return NextResponse.json({ success: true, data: validation });

      case 'performance_report':
        const perfId = searchParams.get('id');
        if (!perfId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for performance report' }, { status: 400 });
        }
        
        const perfTheme = await adaptiveThemesService.get_theme_by_id(perfId);
        if (!perfTheme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const perfReport = await adaptiveThemesService.test_theme_performance(perfTheme);
        return NextResponse.json({ success: true, data: perfReport });

      case 'accessibility_report':
        const a11yId = searchParams.get('id');
        if (!a11yId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for accessibility report' }, { status: 400 });
        }
        
        const a11yTheme = await adaptiveThemesService.get_theme_by_id(a11yId);
        if (!a11yTheme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const a11yReport = await adaptiveThemesService.check_accessibility(a11yTheme);
        return NextResponse.json({ success: true, data: a11yReport });

      case 'compile_css':
        const cssId = searchParams.get('id');
        if (!cssId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for CSS compilation' }, { status: 400 });
        }
        
        const cssTheme = await adaptiveThemesService.get_theme_by_id(cssId);
        if (!cssTheme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const compiledCSS = await adaptiveThemesService.compile_theme_css(cssTheme);
        return new NextResponse(compiledCSS, {
          headers: {
            'Content-Type': 'text/css',
            'Content-Disposition': `attachment; filename="${cssTheme.name}.css"`
          }
        });

      case 'generate_variables':
        const varsId = searchParams.get('id');
        if (!varsId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for variables generation' }, { status: 400 });
        }
        
        const varsTheme = await adaptiveThemesService.get_theme_by_id(varsId);
        if (!varsTheme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const variables = await adaptiveThemesService.generate_theme_variables(varsTheme);
        return NextResponse.json({ success: true, data: variables });

      case 'build_bundle':
        const bundleId = searchParams.get('id');
        const minify = searchParams.get('minify') === 'true';
        const sourceMaps = searchParams.get('source_maps') === 'true';
        
        if (!bundleId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for bundle build' }, { status: 400 });
        }
        
        const bundleTheme = await adaptiveThemesService.get_theme_by_id(bundleId);
        if (!bundleTheme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const buildOptions = { 
          minify, 
          include_source_maps: sourceMaps,
          target_browsers: ['> 1%', 'last 2 versions'],
          include_unused_styles: false,
          optimize_images: true
        };
        const bundle = await adaptiveThemesService.build_theme_bundle(bundleTheme, buildOptions);
        return NextResponse.json({ success: true, data: bundle });

      case 'export_customizations':
        const exportId = searchParams.get('id');
        if (!exportId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required for customizations export' }, { status: 400 });
        }
        
        const customizations = await adaptiveThemesService.export_customizations(exportId);
        return new NextResponse(customizations, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="theme-customizations-${exportId}.json"`
          }
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Adaptive themes API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create_theme':
        const { theme_data } = body;
        if (!theme_data) {
          return NextResponse.json({ success: false, error: 'Theme data is required' }, { status: 400 });
        }
        
        const newTheme = await adaptiveThemesService.create_theme(theme_data);
        return NextResponse.json({ success: true, data: newTheme });

      case 'activate_theme':
        const { theme_id } = body;
        if (!theme_id) {
          return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
        }
        
        const activated = await adaptiveThemesService.activate_theme(theme_id);
        return NextResponse.json({ 
          success: activated, 
          message: activated ? 'Theme activated successfully' : 'Failed to activate theme' 
        });

      case 'deactivate_theme':
        const { theme_id: deactivateId } = body;
        if (!deactivateId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
        }
        
        const deactivated = await adaptiveThemesService.deactivate_theme(deactivateId);
        return NextResponse.json({ 
          success: deactivated, 
          message: deactivated ? 'Theme deactivated successfully' : 'Failed to deactivate theme' 
        });

      case 'customize_theme':
        const { theme_id: customizeId, customizations } = body;
        if (!customizeId || !customizations) {
          return NextResponse.json({ success: false, error: 'Theme ID and customizations are required' }, { status: 400 });
        }
        
        const customizedTheme = await adaptiveThemesService.customize_theme(customizeId, customizations);
        return NextResponse.json({ success: true, data: customizedTheme });

      case 'reset_customizations':
        const { theme_id: resetId } = body;
        if (!resetId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
        }
        
        const resetTheme = await adaptiveThemesService.reset_customizations(resetId);
        return NextResponse.json({ success: true, data: resetTheme });

      case 'import_customizations':
        const { theme_id: importId, customizations_json } = body;
        if (!importId || !customizations_json) {
          return NextResponse.json({ success: false, error: 'Theme ID and customizations JSON are required' }, { status: 400 });
        }
        
        const importedTheme = await adaptiveThemesService.import_customizations(importId, customizations_json);
        return NextResponse.json({ success: true, data: importedTheme });

      case 'install_from_url':
        const { url } = body;
        if (!url) {
          return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
        }
        
        const installedTheme = await adaptiveThemesService.install_theme_from_url(url);
        return NextResponse.json({ success: true, data: installedTheme });

      case 'install_from_zip':
        const { zip_data } = body;
        if (!zip_data) {
          return NextResponse.json({ success: false, error: 'ZIP data is required' }, { status: 400 });
        }
        
        const zipBuffer = Buffer.from(zip_data, 'base64').buffer;
        const zipTheme = await adaptiveThemesService.install_theme_from_zip(zipBuffer);
        return NextResponse.json({ success: true, data: zipTheme });

      case 'backup_theme':
        const { theme_id: backupId } = body;
        if (!backupId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
        }
        
        const backup = await adaptiveThemesService.backup_theme(backupId);
        return NextResponse.json({ success: true, data: backup });

      case 'restore_theme':
        const { backup_data } = body;
        if (!backup_data) {
          return NextResponse.json({ success: false, error: 'Backup data is required' }, { status: 400 });
        }
        
        const restoredTheme = await adaptiveThemesService.restore_theme(backup_data);
        return NextResponse.json({ success: true, data: restoredTheme });

      case 'generate_adaptive_variants':
        const { theme_id: adaptiveId, conditions } = body;
        if (!adaptiveId || !conditions) {
          return NextResponse.json({ success: false, error: 'Theme ID and conditions are required' }, { status: 400 });
        }
        
        const baseTheme = await adaptiveThemesService.get_theme_by_id(adaptiveId);
        if (!baseTheme) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const variants = await adaptiveThemesService.generate_adaptive_variants(baseTheme, conditions);
        return NextResponse.json({ success: true, data: variants });

      case 'optimize_for_device':
        const { theme_id: optimizeId, device_type } = body;
        if (!optimizeId || !device_type) {
          return NextResponse.json({ success: false, error: 'Theme ID and device type are required' }, { status: 400 });
        }
        
        const themeToOptimize = await adaptiveThemesService.get_theme_by_id(optimizeId);
        if (!themeToOptimize) {
          return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
        }
        
        const optimizedTheme = await adaptiveThemesService.optimize_theme_for_device(themeToOptimize, device_type);
        return NextResponse.json({ success: true, data: optimizedTheme });

      case 'create_from_brand':
        const { brand_guidelines } = body;
        if (!brand_guidelines) {
          return NextResponse.json({ success: false, error: 'Brand guidelines are required' }, { status: 400 });
        }
        
        const brandTheme = await adaptiveThemesService.create_theme_from_brand_guidelines(brand_guidelines);
        return NextResponse.json({ success: true, data: brandTheme });

      case 'update_from_marketplace':
        const { theme_id: updateId } = body;
        if (!updateId) {
          return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
        }
        
        const updatedTheme = await adaptiveThemesService.update_theme_from_marketplace(updateId);
        return NextResponse.json({ success: true, data: updatedTheme });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Adaptive themes API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_theme':
        const { theme_id, updates } = body;
        if (!theme_id || !updates) {
          return NextResponse.json({ success: false, error: 'Theme ID and updates are required' }, { status: 400 });
        }
        
        const updatedTheme = await adaptiveThemesService.update_theme(theme_id, updates);
        return NextResponse.json({ success: true, data: updatedTheme });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Adaptive themes API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('id');

    if (!themeId) {
      return NextResponse.json({ success: false, error: 'Theme ID is required' }, { status: 400 });
    }

    const deleted = await adaptiveThemesService.delete_theme(themeId);
    return NextResponse.json({ 
      success: deleted, 
      message: deleted ? 'Theme deleted successfully' : 'Theme not found or cannot be deleted' 
    });
  } catch (error) {
    console.error('Adaptive themes API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
