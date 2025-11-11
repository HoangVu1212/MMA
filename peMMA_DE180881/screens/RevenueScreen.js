
import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getOrders } from '../db/db';

export default function RevenueScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(()=> {
    getOrders((rows)=> setOrders(rows));
  }, []);

  const total = orders.reduce((s,o)=> s + (o.total||0), 0);

  return (
    <View style={{flex:1, padding:12}}>
      <Text style={{fontSize:20}}>Revenue</Text>
      <Text style={{marginTop:8}}>Total revenue: ${total.toFixed(2)}</Text>
      <FlatList data={orders} keyExtractor={item=>item.id.toString()} renderItem={({item})=>(
        <View style={{borderWidth:1, borderColor:'#ddd', padding:8, marginTop:8, borderRadius:6}}>
          <Text>Order #{item.id}</Text>
          <Text>Amount: ${item.total}</Text>
          <Text>Date: {item.createdAt}</Text>
        </View>
      )} />
    </View>
  );
}
