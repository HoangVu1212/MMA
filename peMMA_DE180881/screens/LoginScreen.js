
import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findUserByEmail } from '../db/db';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('remembered').then(v => {
      if (v) {
        const data = JSON.parse(v);
        setEmail(data.email);
        setPassword(data.password);
        setRemember(true);
      }
    });
  }, []);

  const onLogin = () => {
    if (!email || !password) {
      Alert.alert('Error','Fill email and password');
      return;
    }
    findUserByEmail(email, (users) => {
      if (users.length === 0) {
        Alert.alert('Error','User not found');
        return;
      }
      const u = users[0];
      if (u.password !== password) {
        Alert.alert('Error','Wrong password');
        return;
      }
      if (remember) {
        AsyncStorage.setItem('remembered', JSON.stringify({email, password}));
      } else {
        AsyncStorage.removeItem('remembered');
      }
      navigation.replace('Products');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:12}}>
        <TouchableOpacity onPress={() => setRemember(!remember)} style={{marginRight:8}}>
          <View style={{width:20, height:20, borderWidth:1, alignItems:'center', justifyContent:'center'}}>
            {remember ? <View style={{width:14, height:14, backgroundColor:'#333'}} /> : null}
          </View>
        </TouchableOpacity>
        <Text>Remember me</Text>
      </View>
      <Button title="Login" onPress={onLogin} />
      <View style={{marginTop:12}}>
        <Button title="Register" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:'center' },
  title: { fontSize:24, marginBottom:12, textAlign:'center' },
  input: { borderWidth:1, borderColor:'#ccc', padding:8, marginBottom:8, borderRadius:6 }
});
