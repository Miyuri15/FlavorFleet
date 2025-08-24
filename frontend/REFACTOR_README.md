# FlavorFleet Frontend - Refactored Structure

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Form/            # Form components (Input, Select, Textarea)
│   ├── Loading/         # Loading components
│   ├── Error/           # Error handling components
│   ├── OrderComponent/  # Order-related components
│   ├── Delivery/        # Delivery-related components
│   └── index.js         # Component exports
├── context/             # React contexts
│   ├── AuthContext.jsx  # Authentication context
│   ├── NotificationContext.jsx # Notification management
│   └── ThemeContext.jsx # Theme management
├── hooks/               # Custom React hooks
│   ├── useProfile.js    # Profile management
│   ├── useRestaurant.js # Restaurant operations
│   ├── useOrder.js      # Order and cart management
│   ├── useFormValidation.js # Form validation
│   └── index.js         # Hook exports
├── pages/               # Page components
├── routes/              # Route configuration
│   ├── index.js         # Route constants & lazy components
│   └── routeConfig.jsx  # Route definitions
├── services/            # API services
│   └── api.js           # Unified API client
├── utils/               # Utility functions
│   └── helpers.js       # Common helper functions
├── config/              # Configuration
│   └── index.js         # Environment & app configuration
└── constants/           # App constants
    ├── appConstants.js  # Business logic constants
    └── index.js         # Consolidated exports
```

## 🚀 Key Improvements

### 1. **Route Management**
- **Lazy Loading**: All components are lazy-loaded for better performance
- **Organized Structure**: Routes grouped by functionality (public, user, admin, etc.)
- **Route Constants**: Centralized route definitions

### 2. **State Management**
- **Custom Hooks**: Encapsulated business logic in reusable hooks
- **Context Providers**: Clean context organization for global state
- **Form Validation**: Comprehensive form handling with validation

### 3. **API Layer**
- **Unified Client**: Single API client configuration with interceptors
- **Service Functions**: Organized API calls by domain
- **Error Handling**: Centralized error handling and notifications

### 4. **Component Organization**
- **Index Files**: Clean imports with barrel exports
- **Reusable Components**: Generic form components and UI elements
- **Error Boundaries**: Proper error handling at component level

### 5. **Developer Experience**
- **Type Safety**: PropTypes for component validation
- **Constants**: Centralized app constants and configuration
- **Utilities**: Common helper functions for reusability

## 📋 Usage Examples

### Using Custom Hooks

```jsx
// Profile management
import { useProfile } from '../hooks/useProfile';

const ProfileComponent = () => {
  const { profileData, loading, updateProfile } = useProfile();
  // Component logic...
};

// Restaurant operations
import { useRestaurants } from '../hooks/useRestaurant';

const RestaurantList = () => {
  const { restaurants, loading, error } = useRestaurants();
  // Component logic...
};
```

### Form Validation

```jsx
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import { FormInput } from '../components/Form';

const LoginForm = () => {
  const form = useFormValidation(
    { email: '', password: '' },
    {
      email: [validationRules.required, validationRules.email],
      password: [validationRules.required, validationRules.minLength(8)]
    }
  );

  return (
    <form onSubmit={form.handleSubmit(handleLogin)}>
      <FormInput
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.errors.email}
        touched={form.touched.email}
      />
      {/* More form fields... */}
    </form>
  );
};
```

### Notifications

```jsx
import { useNotification } from '../context/NotificationContext';

const SomeComponent = () => {
  const { showToast } = useNotification();

  const handleSuccess = () => {
    showToast.success('Operation completed successfully!');
  };

  const handleError = () => {
    showToast.error('Something went wrong');
  };
};
```

## 🔧 Configuration

### Environment Variables

```env
VITE_GATEWAY_BACKEND_URL=http://localhost:3001
VITE_RESTAURANT_BACKEND_URL=http://localhost:3002
VITE_ORDER_BACKEND_URL=http://localhost:3003
VITE_DELIVERY_BACKEND_URL=http://localhost:3004
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Feature Flags

```jsx
import { FEATURES } from '../config';

if (FEATURES.DARK_MODE) {
  // Dark mode functionality
}

if (FEATURES.DEBUG_MODE) {
  console.log('Debug information');
}
```

## 📦 Dependencies

### New Dependencies Added
- `react-error-boundary`: Better error handling
- `react-toastify`: Notification system (if not already present)

### Existing Dependencies Used
- `react-router-dom`: Routing
- `axios`: HTTP client
- `prop-types`: Type checking
- `sweetalert2`: Modal dialogs

## 🧪 Testing the Refactored Structure

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Check for Import Errors**
   - All components should import correctly
   - Custom hooks should work without issues
   - Context providers should be accessible

3. **Test Key Functionality**
   - Authentication flow
   - Route navigation
   - Form validation
   - API calls
   - Error handling

## 🔄 Migration Guide

### For Existing Components

1. **Update Imports**
   ```jsx
   // Old way
   import Layout from '../../components/Layout';
   import api from '../../../api';

   // New way
   import { Layout } from '../../components';
   import { authService } from '../../services/api';
   ```

2. **Use Custom Hooks**
   ```jsx
   // Old way
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   // Manual API calls...

   // New way
   const { profileData, loading, error, updateProfile } = useProfile();
   ```

3. **Form Validation**
   ```jsx
   // Old way
   const [errors, setErrors] = useState({});
   // Manual validation...

   // New way
   const form = useFormValidation(initialValues, validationRules);
   ```

## 🎯 Next Steps

1. **Component Migration**: Gradually migrate existing components to use new structure
2. **Testing**: Add unit tests for custom hooks and components
3. **Performance**: Implement React.memo where needed
4. **Documentation**: Add JSDoc comments for better code documentation
5. **TypeScript**: Consider migrating to TypeScript for better type safety

## 🐛 Common Issues

1. **Import Errors**: Make sure all index.js files are correctly set up
2. **Context Issues**: Ensure components are wrapped with necessary providers
3. **Environment Variables**: Check that all VITE_ prefixed variables are set

## 📚 Additional Resources

- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [React Router Documentation](https://reactrouter.com/)
- [Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [Code Splitting](https://reactjs.org/docs/code-splitting.html)
