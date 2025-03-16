import { useState, useRef, useEffect } from 'react'
import { 
  AiOutlineCamera,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineEdit,
  AiOutlineSave,
  AiOutlineClose
} from 'react-icons/ai'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/Label"
import axios from 'axios'
import { API_GET_USER_BY_ID, API_UPDATE_USER_URL } from '../../utils/api'
import { useSelector } from 'react-redux'

interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: {
    publicId: string;
    url: string;
  };
  phone?: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<IUser | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<IUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("/avatars/user.png")
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const userId = useSelector((state: any) => state.user.auth.userInfo.id)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_GET_USER_BY_ID}/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        })

        if (response.data.success) {
          const user = response.data.data
          setUserData(user)
          setFormData(user)
          setAvatarUrl(user.avatar.url)
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to fetch user data')
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && userData) {
      try {
        const formData = new FormData()
        formData.append('avatarFile', file)

        const response = await axios.patch(
          `${API_UPDATE_USER_URL}/${userId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        )

        if (response.status === 200) {
          const updatedUser = response.data.user
          setAvatarUrl(updatedUser.avatar.url)
          setUserData(updatedUser)
          setFormData(updatedUser)
          toast.success('Profile photo updated!')
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update profile photo')
        console.error('Error uploading avatar:', error)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleSave = async () => {
    if (!formData || !userData) return

    try {
      const response = await axios.patch(
        `${API_UPDATE_USER_URL}/${userId}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined // Ensure empty string is sent as undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      )

      if (response.status === 200) {
        const updatedUser = response.data.user
        setUserData(updatedUser)  // Update userData with server response
        setFormData(updatedUser)  // Sync formData with server response
        setEditMode(false)
        toast.success('Profile updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData(userData)  // Reset formData to original userData
    setEditMode(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!userData || !formData) {
    return <div className="flex justify-center items-center h-screen">Error loading profile</div>
  }

  return (
    <div className="space-y-8 p-4 max-w-3xl mx-auto">
      <Card className="relative overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Profile Information</CardTitle>
            <div className="flex gap-2">
              {!editMode ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditMode(true)}
                >
                  <AiOutlineEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <AiOutlineSave className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <AiOutlineClose className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative group mb-8">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">
                {userData.firstName[0]}{userData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {editMode && (
              <button 
                onClick={handleUploadPhoto}
                className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 transition-colors"
              >
                <AiOutlineCamera className="h-5 w-5" />
              </button>
            )}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editMode}
                // className={!editMode ? "border-none" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editMode}
                // className={!editMode ? "border-none" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <AiOutlineMail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                // className={!editMode ? "bg-gray-100 border-none" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <AiOutlinePhone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleInputChange}
                disabled={!editMode}
                // className={!editMode ? "bg-gray-100 border-none" : ""}
                placeholder="Not provided"
              />
            </div>
          </div>
        </CardContent>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
      </Card>
    </div>
  )
}

export default Profile