
import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { addProduct, updateProduct } from '../db/db';

export default function ProductFormScreen({ route, navigation }) {
  const product = route.params?.product;
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price ? String(product.price) : '');
  const [image, setImage] = useState(product?.image || '');

  const onSave = () => {
    if (!name || !price) {
      Alert.alert('Error','Please provide name and price');
      return;
    }
    const p = { name, description, price: parseFloat(price), image };
    if (product) {
      p.id = product.id;
      updateProduct(p, ()=> navigation.goBack(), (e)=>Alert.alert('DB Error', JSON.stringify(e)));
    } else {
      addProduct(p, ()=> navigation.goBack(), (e)=>Alert.alert('DB Error', JSON.stringify(e)));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product ? 'Edit Product' : 'Add Product'}</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} multiline />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Image URL (optional)" value={image} onChangeText={setImage} style={styles.input} />
      <Button title="Save" onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16 },
  title: { fontSize:20, marginBottom:12 },
  input: { borderWidth:1, borderColor:'#ccc', padding:8, marginBottom:8, borderRadius:6 }
});
