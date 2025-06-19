'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  UserPlus,
  Trash2,
  Settings,
  FileText,
  Calendar
} from 'lucide-react'

const mockActivities = [
  {
    id: 1,
    user: 'أحمد محمد السالم',
    action: 'نشر مقال',
    target: 'السياسة الاقتصادية الجديدة',
    time: 'منذ 5 دقائق',
    type: 'publish',
    category: 'مقالات'
  },
  {
    id: 2,
    user: 'فاطمة العلي',
    action: 'تعديل مقال',
    target: 'نتائج الدوري السعودي',
    time: 'منذ 15 دقيقة',
    type: 'edit',
    category: 'مقالات'
  },
  {
    id: 3,
    user: 'سالم الشهري',
    action: 'إضافة مستخدم',
    target: 'محمد العتيبي',
    time: 'منذ ساعة',
    type: 'user_add',
    category: 'مستخدمين'
  },
  {
    id: 4,
    user: 'نورا القحطاني',
    action: 'تدقيق مقال',
    target: 'أخبار التقنية اليوم',
    time: 'منذ ساعتين',
    type: 'review',
    category: 'مقالات'
  },
  {
    id: 5,
    user: 'خالد المطيري',
    action: 'رفع صورة',
    target: 'معرض الصور الرياضية',
    time: 'منذ 3 ساعات',
    type: 'upload',
    category: 'وسائط'
  }
]

const getActionIcon = (type: string) => {
  switch (type) {
    case 'publish': return <FileText className='w-4 h-4 text-green-500' />
    case 'edit': return <Edit className='w-4 h-4 text-blue-500' />
    case 'user_add': return <UserPlus className='w-4 h-4 text-purple-500' />
    case 'review': return <Eye className='w-4 h-4 text-orange-500' />
    case 'upload': return <Download className='w-4 h-4 text-teal-500' />
    default: return <Activity className='w-4 h-4 text-gray-500' />
  }
}

const getActionColor = (type: string) => {
  switch (type) {
    case 'publish': return 'bg-green-100 text-green-800'
    case 'edit': return 'bg-blue-100 text-blue-800'
    case 'user_add': return 'bg-purple-100 text-purple-800'
    case 'review': return 'bg-orange-100 text-orange-800'
    case 'upload': return 'bg-teal-100 text-teal-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredActivities = mockActivities.filter(activity =>
    activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.target.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className='p-6 space-y-6' dir='rtl'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>سجل النشاطات</h1>
          <p className='text-gray-600'>مراقبة وتتبع جميع أنشطة النظام والمستخدمين</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>
            <Download className='w-4 h-4 ml-2' />
            تصدير التقرير
          </Button>
          <Button variant='outline'>
            <Filter className='w-4 h-4 ml-2' />
            تصفية متقدمة
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-600'>النشاطات اليوم</p>
                <p className='text-2xl font-bold'>127</p>
              </div>
              <Activity className='w-8 h-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className='p-4'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-600'>المقالات المنشورة</p>
                <p className='text-2xl font-bold text-green-600'>23</p>
              </div>
              <FileText className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className='p-4'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-600'>المستخدمين النشطين</p>
                <p className='text-2xl font-bold text-purple-600'>18</p>
              </div>
              <UserPlus className='w-8 h-8 text-purple-500' />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className='p-4'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-gray-600'>التعديلات</p>
                <p className='text-2xl font-bold text-orange-600'>45</p>
              </div>
              <Edit className='w-8 h-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className='p-4'>
          <div className='relative'>
            <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='البحث في النشاطات...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pr-10'
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='w-5 h-5' />
            سجل النشاطات الأخيرة ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-right'>المستخدم</TableHead>
                  <TableHead className='text-right'>النشاط</TableHead>
                  <TableHead className='text-right'>الهدف</TableHead>
                  <TableHead className='text-right'>الفئة</TableHead>
                  <TableHead className='text-right'>الوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id} className='hover:bg-gray-50'>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-8 h-8'>
                          <AvatarFallback className='bg-blue-100 text-blue-700 text-xs'>
                            {activity.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-medium'>{activity.user}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {getActionIcon(activity.type)}
                        <span>{activity.action}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className='text-gray-700'>{activity.target}</span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getActionColor(activity.type)}>
                        {activity.category}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className='flex items-center gap-1 text-gray-500'>
                        <Calendar className='w-3 h-3' />
                        <span className='text-sm'>{activity.time}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
