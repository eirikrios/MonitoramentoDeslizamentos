import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, ViewStyle } from 'react-native';
import { Button, Input } from 'react-native-elements';
import styled from 'styled-components/native';
import DoctorList from '../components/DoctorList';
import Header from '../components/Header';
import TimeSlotList from '../components/TimeSlotList';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { RootStackParamList } from '../types/navigation';

type CreateAppointmentScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'CreateAppointment'>;
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
    soilMoisture: selectedSoilMoisture, // Adiciona a umidade do solo
    soilSlope: selectedSoilSlope,      // Adiciona a inclinação do terreno
}

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    image: string;
}

const soilMoistureOptions = ['Seco', 'Úmido', 'Encharcado'];
const soilSlopeOptions = ['Plano', 'Leve', 'Íngreme'];


// Lista de médicos disponíveis
const availableDoctors: Doctor[] = [
    {
        id: '1',
        name: 'Zona Sul',
        specialty: 'São Paulo',
        image: 'https://img.freepik.com/vetores-gratis/localizacao_53876-25530.jpg?semt=ais_hybrid&w=740',
    },
    {
        id: '2',
        name: 'Zona Norte',
        specialty: 'São Paulo',
        image: 'https://img.freepik.com/vetores-gratis/localizacao_53876-25530.jpg?semt=ais_hybrid&w=740',
    },
    {
        id: '3',
        name: 'Zona Oeste',
        specialty: 'São Paulo',
        image: 'https://img.freepik.com/vetores-gratis/localizacao_53876-25530.jpg?semt=ais_hybrid&w=740',
    },
    {
        id: '4',
        name: 'Zona Leste',
        specialty: 'São Paulo',
        image: 'https://img.freepik.com/vetores-gratis/localizacao_53876-25530.jpg?semt=ais_hybrid&w=740',
    },
    {
        id: '5',
        name: 'Centro',
        specialty: 'São Paulo',
        image: 'https://img.freepik.com/vetores-gratis/localizacao_53876-25530.jpg?semt=ais_hybrid&w=740',
    },
];

const CreateAppointmentScreen: React.FC = () => {
    const { user } = useAuth();
    const navigation = useNavigation<CreateAppointmentScreenProps['navigation']>();
    const [date, setDate] = useState('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSoilMoisture, setSelectedSoilMoisture] = useState<string>('');
    const [selectedSoilSlope, setSelectedSoilSlope] = useState<string>('');

    const handleCreateAppointment = async () => {
        try {
            setLoading(true);
            setError('');

            // Validação apenas para os campos obrigatórios
            if (!date || !selectedSoilMoisture || !selectedSoilSlope || !selectedDoctor) {
                setError('Por favor, preencha a data, selecione a umidade do solo, inclinação e local.');
                return;
            }

            // Recupera consultas existentes
            const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
            const appointments: Appointment[] = storedAppointments ? JSON.parse(storedAppointments) : [];

            // Cria nova consulta
            const newAppointment: Appointment = {
                id: Date.now().toString(),
                patientId: user?.id || '',
                doctorId: selectedDoctor.id,
                doctorName: selectedDoctor.name,
                date,
                time: '', // Campo vazio, pois não será mais solicitado
                specialty: selectedDoctor.specialty,
                status: 'pending',
                soilMoisture: selectedSoilMoisture, // Adiciona a umidade do solo
                soilSlope: selectedSoilSlope,      // Adiciona a inclinação do terreno
            };

            // Adiciona nova consulta à lista
            appointments.push(newAppointment);

            // Salva lista atualizada
            await AsyncStorage.setItem('@MedicalApp:appointments', JSON.stringify(appointments));

            alert('Consulta agendada com sucesso!');
            navigation.goBack();
        } catch (err) {
            setError('Erro ao agendar consulta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Title>Inserir Dados Ambientais</Title>

                <Input
                    placeholder="Data (DD/MM/AAAA)"
                    value={date}
                    onChangeText={setDate}
                    containerStyle={styles.input}
                    keyboardType="numeric"
                />

                <SectionTitle>Selecione a Umidade do Solo</SectionTitle>
                {soilMoistureOptions.map((option) => (
                    <Button
                        key={option}
                        title={option}
                        onPress={() => setSelectedSoilMoisture(option)}
                        buttonStyle={[
                            styles.optionButton,
                            selectedSoilMoisture === option && styles.selectedOption,
                        ]}
                    />
                ))}

                <SectionTitle>Selecione a Inclinação do Solo</SectionTitle>
                {soilSlopeOptions.map((option) => (
                    <Button
                        key={option}
                        title={option}
                        onPress={() => setSelectedSoilSlope(option)}
                        buttonStyle={[
                            styles.optionButton,
                            selectedSoilSlope === option && styles.selectedOption,
                        ]}
                    />
                ))}

                <SectionTitle>Selecione um Local</SectionTitle>
                <DoctorList
                    doctors={availableDoctors}
                    onSelectDoctor={setSelectedDoctor}
                    selectedDoctorId={selectedDoctor?.id}
                />

                {error ? <ErrorText>{error}</ErrorText> : null}

                <Button
                    title="Inserir Dados"
                    onPress={handleCreateAppointment}
                    loading={loading}
                    containerStyle={styles.button as ViewStyle}
                    buttonStyle={styles.buttonStyle}
                />

                <Button
                    title="Cancelar"
                    onPress={() => navigation.goBack()}
                    containerStyle={styles.button as ViewStyle}
                    buttonStyle={styles.cancelButton}
                />
            </ScrollView>
        </Container>
    );
};

const styles = {
    scrollContent: {
        padding: 20,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        width: '100%',
    },
    buttonStyle: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
    },
    cancelButton: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: 12,
    },
    optionButton: {
        marginVertical: 5,
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    selectedOption: {
        backgroundColor: theme.colors.secondary,
    },
};

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 20px;
  text-align: center;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-bottom: 10px;
  margin-top: 10px;
`;

const ErrorText = styled.Text`
  color: ${theme.colors.error};
  text-align: center;
  margin-bottom: 10px;
`;

export default CreateAppointmentScreen;