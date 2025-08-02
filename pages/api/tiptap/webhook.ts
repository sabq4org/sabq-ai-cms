/**
 * Tiptap Webhook Handler
 * استقبال تحديثات التعاون من Tiptap Cloud وحفظها في Supabase
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

// إعداد Supabase مع Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface WebhookPayload {
  type: 'document.update' | 'comment.add' | 'comment.update' | 'comment.delete' | 'user.join' | 'user.leave';
  timestamp: string;
  documentId: string;
  document?: {
    id: string;
    content: any;
    html?: string;
    updatedAt: string;
    updatedBy?: {
      id: string;
      name: string;
      email: string;
    };
  };
  comment?: {
    id: string;
    content: string;
    documentId: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt?: string;
    position?: {
      from: number;
      to: number;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    color: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔔 استقبال Webhook من Tiptap:', {
    method: req.method,
    headers: Object.keys(req.headers),
    bodySize: JSON.stringify(req.body).length,
    timestamp: new Date().toISOString()
  });

  // التحقق من طريقة HTTP
  if (req.method !== 'POST') {
    console.log('❌ طريقة HTTP غير مدعومة:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // التحقق من التوقيع (إذا كان متاحاً)
    const secret = process.env.TIPTAP_APP_SECRET;
    if (secret) {
      const signature = req.headers['x-tiptap-signature'] as string;
      const body = JSON.stringify(req.body);

      if (signature) {
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(body)
          .digest('hex');

        if (signature !== expectedSignature) {
          console.log('❌ توقيع غير صحيح');
          return res.status(401).json({ error: 'Invalid signature' });
        }
        console.log('✅ تم التحقق من التوقيع بنجاح');
      }
    }

    const payload: WebhookPayload = req.body;
    console.log('📦 بيانات Webhook:', {
      type: payload.type,
      documentId: payload.documentId,
      timestamp: payload.timestamp
    });

    // معالجة أنواع الأحداث المختلفة
    switch (payload.type) {
      case 'document.update':
        await handleDocumentUpdate(payload);
        break;

      case 'comment.add':
        await handleCommentAdd(payload);
        break;

      case 'comment.update':
        await handleCommentUpdate(payload);
        break;

      case 'comment.delete':
        await handleCommentDelete(payload);
        break;

      case 'user.join':
        await handleUserJoin(payload);
        break;

      case 'user.leave':
        await handleUserLeave(payload);
        break;

      default:
        console.log('⚠️ نوع حدث غير معروف:', payload.type);
        break;
    }

    console.log('✅ تم معالجة Webhook بنجاح');
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      type: payload.type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ خطأ في معالجة Webhook:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// معالجة تحديث المستند
async function handleDocumentUpdate(payload: WebhookPayload) {
  if (!payload.document) {
    console.log('⚠️ لا توجد بيانات مستند في التحديث');
    return;
  }

  const { document } = payload;
  console.log('📝 تحديث مستند:', {
    id: document.id,
    contentLength: JSON.stringify(document.content).length,
    updatedBy: document.updatedBy?.name || 'غير معروف'
  });

  try {
    // حفظ أو تحديث المستند في Supabase
    const { error } = await supabase
      .from('documents')
      .upsert({
        id: document.id,
        content: document.content,
        html_content: document.html || '',
        updated_at: document.updatedAt,
        updated_by: document.updatedBy?.id || null,
        updated_by_name: document.updatedBy?.name || null,
        updated_by_email: document.updatedBy?.email || null,
      });

    if (error) {
      console.error('❌ خطأ في حفظ المستند:', error);
      throw error;
    }

    // إضافة سجل في تاريخ التغييرات
    await supabase
      .from('document_history')
      .insert({
        document_id: document.id,
        content: document.content,
        updated_by: document.updatedBy?.id || null,
        updated_by_name: document.updatedBy?.name || null,
        updated_at: document.updatedAt,
        change_type: 'content_update'
      });

    console.log('✅ تم حفظ المستند بنجاح');
  } catch (error) {
    console.error('❌ خطأ في حفظ المستند:', error);
    throw error;
  }
}

// معالجة إضافة تعليق
async function handleCommentAdd(payload: WebhookPayload) {
  if (!payload.comment) {
    console.log('⚠️ لا توجد بيانات تعليق في الإضافة');
    return;
  }

  const { comment } = payload;
  console.log('💬 إضافة تعليق:', {
    id: comment.id,
    documentId: comment.documentId,
    author: comment.createdBy.name,
    contentLength: comment.content.length
  });

  try {
    const { error } = await supabase
      .from('comments')
      .insert({
        id: comment.id,
        content: comment.content,
        document_id: comment.documentId,
        author_id: comment.createdBy.id,
        author_name: comment.createdBy.name,
        author_email: comment.createdBy.email,
        created_at: comment.createdAt,
        position_from: comment.position?.from || null,
        position_to: comment.position?.to || null,
        status: 'active'
      });

    if (error) {
      console.error('❌ خطأ في حفظ التعليق:', error);
      throw error;
    }

    console.log('✅ تم حفظ التعليق بنجاح');
  } catch (error) {
    console.error('❌ خطأ في حفظ التعليق:', error);
    throw error;
  }
}

// معالجة تحديث تعليق
async function handleCommentUpdate(payload: WebhookPayload) {
  if (!payload.comment) {
    console.log('⚠️ لا توجد بيانات تعليق في التحديث');
    return;
  }

  const { comment } = payload;
  console.log('✏️ تحديث تعليق:', {
    id: comment.id,
    documentId: comment.documentId
  });

  try {
    const { error } = await supabase
      .from('comments')
      .update({
        content: comment.content,
        updated_at: comment.updatedAt || new Date().toISOString(),
      })
      .eq('id', comment.id);

    if (error) {
      console.error('❌ خطأ في تحديث التعليق:', error);
      throw error;
    }

    console.log('✅ تم تحديث التعليق بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تحديث التعليق:', error);
    throw error;
  }
}

// معالجة حذف تعليق
async function handleCommentDelete(payload: WebhookPayload) {
  if (!payload.comment) {
    console.log('⚠️ لا توجد بيانات تعليق في الحذف');
    return;
  }

  const { comment } = payload;
  console.log('🗑️ حذف تعليق:', {
    id: comment.id,
    documentId: comment.documentId
  });

  try {
    // حذف ناعم - تغيير الحالة إلى deleted
    const { error } = await supabase
      .from('comments')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', comment.id);

    if (error) {
      console.error('❌ خطأ في حذف التعليق:', error);
      throw error;
    }

    console.log('✅ تم حذف التعليق بنجاح');
  } catch (error) {
    console.error('❌ خطأ في حذف التعليق:', error);
    throw error;
  }
}

// معالجة انضمام مستخدم
async function handleUserJoin(payload: WebhookPayload) {
  if (!payload.user) {
    console.log('⚠️ لا توجد بيانات مستخدم في الانضمام');
    return;
  }

  const { user } = payload;
  console.log('👋 انضمام مستخدم:', {
    id: user.id,
    name: user.name,
    documentId: payload.documentId
  });

  try {
    // تسجيل نشاط المستخدم
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        document_id: payload.documentId,
        activity_type: 'join',
        timestamp: payload.timestamp
      });

    console.log('✅ تم تسجيل انضمام المستخدم');
  } catch (error) {
    console.error('❌ خطأ في تسجيل انضمام المستخدم:', error);
    // لا نرمي خطأ هنا لأن هذا ليس حرجاً
  }
}

// معالجة مغادرة مستخدم
async function handleUserLeave(payload: WebhookPayload) {
  if (!payload.user) {
    console.log('⚠️ لا توجد بيانات مستخدم في المغادرة');
    return;
  }

  const { user } = payload;
  console.log('👋 مغادرة مستخدم:', {
    id: user.id,
    name: user.name,
    documentId: payload.documentId
  });

  try {
    // تسجيل نشاط المستخدم
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        document_id: payload.documentId,
        activity_type: 'leave',
        timestamp: payload.timestamp
      });

    console.log('✅ تم تسجيل مغادرة المستخدم');
  } catch (error) {
    console.error('❌ خطأ في تسجيل مغادرة المستخدم:', error);
    // لا نرمي خطأ هنا لأن هذا ليس حرجاً
  }
}
