
import React, {useEffect, useState} from 'react';
import { View, Text, Image, Button, StyleSheet, Alert } from 'react-native';
import { getProducts, addToCart } from '../db/db';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  useEffect(()=> {
    getProducts((rows)=> {
      const p = rows.find(r=>r.id === id);
      setProduct(p);
    });
  }, []);

  if (!product) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Loading...</Text></View>;

  return (
    <View style={{flex:1, padding:16}}>
      {product.image ? <Image source={{uri:product.image}} style={{width:'100%', height:200}} /> : null}
      <Text style={{fontSize:22, fontWeight:'bold', marginTop:12}}>{product.name}</Text>
      <Text style={{marginTop:8}}>{product.description}</Text>
      <Text style={{marginTop:8, fontSize:18}}>${product.price}</Text>
      <View style={{marginTop:12}}>
        <Button title="Add to Cart" onPress={()=> {
          addToCart(product.id, 1, ()=> { Alert.alert('Added','Product added to cart'); }, (e)=>Alert.alert('Error', JSON.stringify(e)));
        }} />
      </View>
    </View>
  );
}
