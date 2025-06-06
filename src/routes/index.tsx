import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateAppointmentScreen from '../screens/CreateAppointmentScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RiskScreen from '../screens/RiskScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateAppointment" component={CreateAppointmentScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="RiskScreen" component={RiskScreen} />
            <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
        </Stack.Navigator>
    );
}