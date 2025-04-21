'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  photoURL: string | null;
createdAt: Timestamp;
}

export default function DashboardPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">Welcome to your VibeBuild dashboard!</p>
      
      <UserProfile />
    </div>
  );
}

function UserProfile() {
  const { logout, user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p>Loading profile...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <div className="grid gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
          <p className="font-medium">{userData?.name || user?.displayName || 'User'}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-medium">{userData?.email || user?.email}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
          <p className="font-medium">
            {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      
      <Button onClick={logout} variant="outline">Sign Out</Button>
    </div>
  );
}
