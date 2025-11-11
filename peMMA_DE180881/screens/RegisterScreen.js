
import React, {useState} from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { addUser, findUserByEmail } from '../db/db';

export default function RegisterScreen({ navigation }) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const validateEmail = (e) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const onRegister = () => {
    if (!fullname || !email || !password || !confirm) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    findUserByEmail(email, (users) => {
      if (users.length > 0) {
        Alert.alert('Error', 'Email already registered');
        return;
      }
      addUser(fullname, email, password, () => {
        Alert.alert('Success', 'Registered successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }, (e) => {
        Alert.alert('DB Error', JSON.stringify(e));
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Full name" value={fullname} onChangeText={setFullname} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput placeholder="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry style={styles.input} />
      <Button title="Register" onPress={onRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:'center' },
  title: { fontSize:24, marginBottom:12, textAlign:'center' },
  input: { borderWidth:1, borderColor:'#ccc', padding:8, marginBottom:8, borderRadius:6 }
});
