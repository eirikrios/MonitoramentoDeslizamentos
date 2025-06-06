import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, TextStyle, ViewStyle } from 'react-native';
import { Button, ListItem, Text } from 'react-native-elements';
import styled from 'styled-components/native';
import { HeaderContainer, HeaderTitle } from '../components/Header';
import theme from '../styles/theme';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
    Home: undefined;
    Risk: undefined; // Certifique-se de que esta rota exista no seu stack de navegação
    AdminDashboard: undefined;
};

type RiskScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Risk'>;
};

interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    specialty: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    soilMoisture: string;
    soilSlope: string;
}

const RiskScreen: React.FC<RiskScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAppointments = async () => {
        try {
            const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
            if (storedAppointments) {
                const allAppointments: Appointment[] = JSON.parse(storedAppointments);
                const userAppointments = allAppointments.filter(
                    (appointment) => appointment.patientId === user?.id
                );
                setAppointments(userAppointments);
            }
        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadAppointments();
        }, [])
    );

    return (
        <Container>
            <HeaderContainer>
                <HeaderTitle>Riscos</HeaderTitle>
            </HeaderContainer>

            <Content>
                <Button
                    title="Voltar"
                    icon={{
                        name: 'arrow-left',
                        type: 'font-awesome',
                        size: 20,
                        color: 'white',
                    }}
                    buttonStyle={{
                        backgroundColor: theme.colors.primary,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20,
                    }}
                    onPress={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Title>Monitoramento de Riscos</Title>

                    {loading ? (
                        <LoadingText>Carregando consultas...</LoadingText>
                    ) : appointments.length === 0 ? (
                        <EmptyText>Nenhuma consulta agendada</EmptyText>
                    ) : (
                        appointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                soilMoisture={appointment.soilMoisture}
                                soilSlope={appointment.soilSlope}
                            >
                                <ListItem.Content>
                                    <ListItem.Title style={styles.doctorName as TextStyle}>
                                        {appointment.doctorName}
                                    </ListItem.Title>
                                    <ListItem.Subtitle style={styles.specialty as TextStyle}>
                                        {appointment.specialty}
                                    </ListItem.Subtitle>
                                    <Text style={styles.dateTime as TextStyle}>
                                        {appointment.date} {appointment.time}
                                    </Text>
                                    <Text style={styles.infoText as TextStyle}>
                                        Umidade: {appointment.soilMoisture}
                                    </Text>
                                    <Text style={styles.infoText as TextStyle}>
                                        Inclinação: {appointment.soilSlope}
                                    </Text>
                                    <StatusBadge status={appointment.status}>
                                        <StatusText status={appointment.status}>
                                            {appointment.status === 'confirmed'
                                                ? 'Confirmada'
                                                : appointment.status === 'cancelled'
                                                    ? 'Cancelada'
                                                    : 'Pendente'}
                                        </StatusText>
                                    </StatusBadge>
                                    
                                </ListItem.Content>
                            </AppointmentCard>
                        ))
                    )}
                </ScrollView>
            </Content>
        </Container>
    );
};

const styles = {
    scrollContent: {
        padding: 20,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    specialty: {
        fontSize: 14,
        color: theme.colors.text,
        marginTop: 4,
    },
    dateTime: {
        fontSize: 14,
        color: theme.colors.text,
        marginTop: 4,
    },
    button: {
        marginTop: 10,
        width: '100%',
    },
    buttonStyle: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        marginBottom: 10,
    },
};

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Content = styled.View`
  flex: 1;
  padding: ${theme.spacing.medium}px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const AppointmentCard = styled(ListItem)`
  background-color: ${theme.colors.background};
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 15px;
  border-width: 1px;
  border-color: ${theme.colors.border};
`;

const LoadingText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: 16px;
  margin-top: 20px;
`;

const StatusBadge = styled.View<{ status: string }>`
  background-color: ${(props) => (props.status === 'confirmed'
        ? theme.colors.success
        : props.status === 'cancelled'
            ? theme.colors.error
            : theme.colors.warning) + '20'};
  padding: 4px 8px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 8px;
`;

const StatusText = styled.Text<{ status: string }>`
  color: ${(props) => (props.status === 'confirmed'
        ? theme.colors.success
        : props.status === 'cancelled'
            ? theme.colors.error
            : theme.colors.warning)};
  font-size: 12px;
  font-weight: 500;
`;

export default RiskScreen;
