
import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { getCart, updateCartItem, removeCartItem, clearCart, createOrder } from '../db/db';

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const load = () => {
    getCart((rows)=> setItems(rows));
  };
  useEffect(()=> {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, []);

  const total = items.reduce((s,i)=> s + (i.price * i.quantity), 0);

  const onCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Cart is empty');
      return;
    }
    createOrder(total, ()=> {
      clearCart(()=> {
        Alert.alert('Success','Order placed', [{text:'OK', onPress: () => navigation.navigate('Revenue')}]);
      });
    });
  };

  return (
    <View style={{flex:1, padding:12}}>
      <Text style={{fontSize:20, marginBottom:8}}>Cart</Text>
      <FlatList data={items} keyExtractor={item=>item.id.toString()} renderItem={({item})=>(
        <View style={{borderWidth:1, borderColor:'#ddd', padding:8, marginBottom:8, borderRadius:6}}>
          <Text style={{fontWeight:'bold'}}>{item.name}</Text>
          <Text>Price: ${item.price}</Text>
          <View style={{flexDirection:'row', alignItems:'center', marginTop:8}}>
            <Text>Qty:</Text>
            <TextInput value={String(item.quantity)} onChangeText={(v)=> {
              const q = parseInt(v) || 0;
              updateCartItem(item.id, q, ()=> load());
            }} style={{borderWidth:1, borderColor:'#ccc', marginLeft:8, padding:4, width:60}} keyboardType="numeric" />
            <View style={{width:8}}/>
            <Button title="Remove" onPress={()=> { removeCartItem(item.id, ()=> load()); }} />
          </View>
        </View>
      )} />

      <Text style={{fontSize:18, marginTop:12}}>Total: ${total.toFixed(2)}</Text>
      <View style={{marginTop:12}}>
        <Button title="Checkout" onPress={onCheckout} />
      </View>
    </View>
  );
}
