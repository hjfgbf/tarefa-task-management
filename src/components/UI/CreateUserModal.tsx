// import { useState, useEffect } from 'react';
// import { User, Team } from '../../types';
// import { apiService } from '../../services/api';
// import { X, User as UserIcon, Building2, Mail, Phone, Shield, Loader2 } from 'lucide-react';

// interface CreateUserModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   userToEdit?: User | null;
//   onUserCreated: (user: User) => void;
//   onUserUpdated: (user: User) => void;
// }

// export function CreateUserModal({
//   isOpen,
//   onClose,
//   userToEdit,
//   onUserCreated,
//   onUserUpdated
// }: CreateUserModalProps) {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     username: '',
//     mobile_number: '',
//     role: 'employee',
//     position: '',
//     team_id: '',
//     is_active: true,
//     password: '',
//     password_confirm: ''
//   });
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [errorMessage, setErrorMessage] = useState<any[]>([]);

//   useEffect(() => {
//     if (isOpen) {
//       loadTeams();
//       if (userToEdit) {
//         setFormData({
//           name: userToEdit.name,
//           email: userToEdit.email,
//           username: userToEdit.username || '',
//           mobile_number: userToEdit.mobile_number || '',
//           role: userToEdit.role,
//           position: userToEdit.position || '',
//           team_id: userToEdit.team_id?.toString() || '',
//           is_active: userToEdit.is_active,
//           password: '',
//           password_confirm: ''
//         });
//       } else {
//         setFormData({
//           name: '',
//           email: '',
//           username: '',
//           mobile_number: '',
//           role: 'employee',
//           position: '',
//           team_id: '',
//           is_active: true,
//           password: '',
//           password_confirm: ''
//         });
//       }
//       setErrors({});
//     }
//   }, [isOpen, userToEdit]);

//   const loadTeams = async () => {
//     try {
//       const response = await apiService.getTeams();
//       setTeams(response.results || []);
//     } catch (error) {
//       console.error('Failed to load teams:', error);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
//     }));

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }

//     if (!formData.username.trim()) {
//       newErrors.username = 'Username is required';
//     }

//     if (!userToEdit && !formData.password.trim()) {
//       newErrors.password = 'Password is required for new users';
//     }

//     if (formData.password && formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     if (!userToEdit && !formData.password_confirm.trim()) {
//       newErrors.password_confirm = 'Password confirmation is required for new users';
//     }

//     if (formData.password && formData.password_confirm && formData.password !== formData.password_confirm) {
//       newErrors.password_confirm = 'Passwords do not match';
//     }

//     if (!formData.role) {
//       newErrors.role = 'Role is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       return;
//     }
//     setLoading(true);
//     try {
//       const userData = {
//         ...formData,
//         team_id: formData.team_id ? parseInt(formData.team_id) : null
//       };
//       if (userToEdit) {
//         // Update user
//         const updatedUser = await apiService.updateUser(userToEdit.id, userData);
//         onUserUpdated(updatedUser);
//       } else {
//         // Create new user
//         const newUser = await apiService.createUser(userData);
//         onUserCreated(newUser);
//       }
//       onClose();
//     } catch (error: any) {
//       console.error('Failed to save user:', error);

//       //   if (error.response?.status === 400 && error.response?.data) {
//       //     const serverErrors: Record<string, string> = {};
//       //     Object.keys(error.response.data).forEach(key => {
//       //       if (Array.isArray(error.response.data[key])) {
//       //         serverErrors[key] = error.response.data[key][0];
//       //       } else {
//       //         serverErrors[key] = error.response.data[key];
//       //       }
//       //     });
//       //     setErrors(serverErrors);
//       //   } else {
//       //     alert('Failed to save user. Please try again.');
//       //   }
//       // } finally {
//       //   setLoading(false);
//       // }
//       setLoading(false);
//       const errData = error?.response?.data;
//       if (errData?.errors && typeof errData.errors === 'object') {
//         const messages = Object.entries(errData.errors).map(
//           ([key, value]) => `\`${key}\`: ${Array.isArray(value) ? value.join(', ') : value}`
//         );
//         setErrorMessage(messages);
//       } else {
//         setErrorMessage([
//           errData?.message ||
//           errData?.details ||
//           'Something went wrong. Please try again later.'
//         ]);
//       }
//     };
//   }
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center space-x-3">
//             <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
//               <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//             </div>
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//               {userToEdit ? 'Edit User' : 'Create New User'}
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//           >
//             <X className="h-5 w-5 text-gray-500" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {/* Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Full Name *
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                 }`}
//               placeholder="Enter full name"
//             />
//             {errors.name && (
//               <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Email *
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                   }`}
//                 placeholder="Enter email address"
//               />
//             </div>
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
//             )}
//           </div>

//           {/* Username */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Username *
//             </label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                 }`}
//               placeholder="Enter username"
//             />
//             {errors.username && (
//               <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
//             )}
//           </div>

//           {/* Mobile Number */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Mobile Number
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="tel"
//                 name="mobile_number"
//                 value={formData.mobile_number}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter mobile number"
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Password {!userToEdit && '*'}
//               {userToEdit && (
//                 <span className="text-xs text-gray-500 ml-1">(leave blank to keep current)</span>
//               )}
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleInputChange}
//               className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                 }`}
//               placeholder={userToEdit ? "Enter new password (optional)" : "Enter password"}
//             />
//             {errors.password && (
//               <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
//             )}
//           </div>

//           {/* Password Confirm */}
//           {!userToEdit && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Confirm Password *
//               </label>
//               <input
//                 type="password"
//                 name="password_confirm"
//                 value={formData.password_confirm}
//                 onChange={handleInputChange}
//                 className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password_confirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                   }`}
//                 placeholder="Confirm your password"
//               />
//               {errors.password_confirm && (
//                 <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password_confirm}</p>
//               )}
//             </div>
//           )}

//           {/* Role */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Role *
//             </label>
//             <div className="relative">
//               <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleInputChange}
//                 className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//                   }`}
//               >
//                 <option value="employee">Employee</option>
//                 <option value="manager">Manager</option>
//                 <option value="admin">Admin</option>
//                 <option value="intern">Intern</option>
//               </select>
//             </div>
//             {errors.role && (
//               <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
//             )}
//           </div>

//           {/* Position */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Position
//             </label>
//             <input
//               type="text"
//               name="position"
//               value={formData.position}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter job position"
//             />
//           </div>

//           {/* Team */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Team
//             </label>
//             <div className="relative">
//               <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <select
//                 name="team_id"
//                 value={formData.team_id}
//                 onChange={handleInputChange}
//                 className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">No Team</option>
//                 {teams.map(team => (
//                   <option key={team.id} value={team.id.toString()}>
//                     {team.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Active Status */}
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="is_active"
//               checked={formData.is_active}
//               onChange={handleInputChange}
//               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//             <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
//               Active User
//             </label>
//           </div>

//           {errorMessage?.length > 0 && (
//             <div className="mb-4 flex justify-end rounded p-3 text-sm text-red-700 space-y-1 max-h-48 overflow-y-auto">
//               {errorMessage?.map((msg, i) => (
//                 <>
//                   <div key={i}>{msg}</div><br />
//                 </>
//               ))}
//             </div>
//           )}
//           {/* Buttons */}
//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
//             >
//               {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//               {userToEdit ? 'Update User' : 'Create User'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { User, Team } from '../../types';
import { apiService } from '../../services/api';
import { X, User as UserIcon, Building2, Mail, Phone, Shield, Loader2, EyeOff, Eye } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: any | null;
  onUserCreated: (user: User) => void;
  onUserUpdated: (user: User) => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  userToEdit,
  onUserCreated,
  onUserUpdated
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    username: '',
    mobile_number: '',
    role: 'employee',
    position: '',
    team_id: '',
    is_active: true,
    password: '',
    password_confirm: ''
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<any[]>([]);

  // ✅ ADDED – password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
console.log(userToEdit)
  useEffect(() => {
    if (isOpen) {
      loadTeams();
      if (userToEdit) {
        setFormData({
          name: userToEdit.name,
          email: userToEdit.email,
          username: userToEdit.username || '',
          mobile_number: userToEdit.mobile_number || '',
          role: userToEdit.role,
          position: userToEdit.position || '',
          team_id: userToEdit.team_id?.toString() || '',
          is_active: userToEdit.is_active,
          password: userToEdit.password,
          password_confirm: userToEdit.password_confirm
        });
      } else {
        setFormData({
          name: '',
          email: '',
          username: '',
          mobile_number: '',
          role: 'employee',
          position: '',
          team_id: '',
          is_active: true,
          password: '',
          password_confirm: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, userToEdit]);

  const loadTeams = async () => {
    try {
      const response = await apiService.getTeams();
      setTeams(response.results || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // mobile number logic (already existing)
    if (name === 'mobile_number') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;

      setFormData((prev:any) => ({
        ...prev,
        mobile_number: numericValue
      }));
      return;
    }

    setFormData((prev:any) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value
    }));

    // ✅ ADDED – confirm password error should stay until match
    if (
      (name === 'password' || name === 'password_confirm') &&
      !userToEdit
    ) {
      const password =
        name === 'password' ? value : formData.password;
      const confirmPassword =
        name === 'password_confirm'
          ? value
          : formData.password_confirm;

      if (password && confirmPassword && password !== confirmPassword) {
        setErrors(prev => ({
          ...prev,
          password_confirm: 'Passwords do not match'
        }));
      } else if (password && confirmPassword && password === confirmPassword) {
        setErrors(prev => ({
          ...prev,
          password_confirm: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!userToEdit && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!userToEdit && !formData.password_confirm.trim()) {
      newErrors.password_confirm = 'Confirm password is required';
    }

    if (
      formData.password &&
      formData.password_confirm &&
      formData.password !== formData.password_confirm
    ) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrorMessage([])
    setLoading(true);
    try {
      const userData = {
        ...formData,
        team_id: formData.team_id ? parseInt(formData.team_id) : null
      };

      if (userToEdit) {
        const updatedUser = await apiService.updateUser(userToEdit.id, userData);
        onUserUpdated(updatedUser);
        if (updatedUser) {
          setErrorMessage([]);
          setLoading(false);
          onClose();
        }
      } else {
        const newUser = await apiService.createUser(userData);
        onUserCreated(newUser);
        if (newUser) {
          setErrorMessage([]);
          setLoading(false);
          onClose();
        }
      }

    } catch (error: any) {
      setLoading(false);
      const errData = error?.error;

      if (errData && typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0];
        const firstValue = errData[firstKey];

        if (Array.isArray(firstValue) && firstValue.length > 0) {
          // ✅ key + value together
          setErrorMessage([`${firstKey}: ${firstValue[0]}`]);
        } else if (typeof firstValue === 'string') {
          setErrorMessage([`${firstKey}: ${firstValue}`]);
        } else {
          setErrorMessage(['Something went wrong. Please try again.']);
        }
      } else {
        setErrorMessage(['Something went wrong. Please try again later.']);
      }
    }

    };

    if (!isOpen) return null;

    /* JSX BELOW — 100% UNCHANGED */
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {userToEdit ? 'Edit User' : 'Create New User'}
              </h2>
            </div>
            <button
              onClick={() => { onClose(), setErrorMessage([]) }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              {!userToEdit && (
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg pr-10"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                  {errors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password_confirm}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter job position"
              />
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id.toString()}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active User
              </label>
            </div>

            {errorMessage?.length > 0 && (
              <div className="mb-1 flex justify-end rounded text-sm text-red-700">
                {errorMessage?.map((msg, i) => (
                  <div key={i}>{msg}</div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { onClose(), setErrorMessage([]) }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {userToEdit ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
