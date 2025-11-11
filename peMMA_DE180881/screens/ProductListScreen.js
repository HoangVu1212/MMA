
import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Button } from 'react-native';
import { getProducts, deleteProduct } from '../db/db';

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(null); // 'asc' or 'desc'

  const load = () => {
    getProducts((rows) => {
      setProducts(rows);
    });
  };
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    load();
    return unsub;
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  if (sort === 'asc') filtered.sort((a,b)=>a.price-b.price);
  if (sort === 'desc') filtered.sort((a,b)=>b.price-a.price);

  return (
    <View style={{flex:1, padding:12}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
        <Text style={{fontSize:20}}>Products</Text>
        <View style={{width:120}}>
          <Button title="Cart" onPress={()=>navigation.navigate('Cart')} />
        </View>
      </View>
      <TextInput placeholder="Search by name" value={q} onChangeText={setQ} style={styles.input} />
      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
        <Button title="Sort ↑" onPress={()=>setSort('asc')} />
        <Button title="Sort ↓" onPress={()=>setSort('desc')} />
        <Button title="Clear" onPress={()=>setSort(null)} />
      </View>

      <FlatList data={filtered} keyExtractor={item=>item.id.toString()} renderItem={({item})=>(
        <TouchableOpacity style={styles.item} onPress={()=>navigation.navigate('ProductDetail', {id: item.id})}>
          {item.image ? <Image source={{uri:item.image}} style={styles.img} /> : <View style={[styles.img, {backgroundColor:'#eee', alignItems:'center', justifyContent:'center'}]}><Text>No image</Text></View>}
          <View style={{flex:1, paddingLeft:8}}>
            <Text style={{fontSize:16, fontWeight:'bold'}}>{item.name}</Text>
            <Text numberOfLines={2}>{item.description}</Text>
            <Text style={{marginTop:6}}>${item.price}</Text>
            <View style={{flexDirection:'row', marginTop:6}}>
              <Button title="Edit" onPress={()=>navigation.navigate('ProductForm', {product: item})} />
              <View style={{width:8}}/>
              <Button title="Delete" onPress={()=>{ deleteProduct(item.id, ()=>load()); }} />
            </View>
          </View>
        </TouchableOpacity>
      )} />

      <TouchableOpacity style={styles.fab} onPress={()=>navigation.navigate('ProductForm')}>
        <Text style={{color:'#fff', fontSize:20}}>＋</Text>
      </TouchableOpacity>

      <View style={{marginTop:12}}>
        <Button title="Revenue" onPress={()=>navigation.navigate('Revenue')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection:'row', padding:8, borderWidth:1, borderColor:'#ddd', marginBottom:8, borderRadius:8 },
  img: { width:80, height:80, borderRadius:6 },
  input: { borderWidth:1, borderColor:'#ccc', padding:8, marginBottom:8, borderRadius:6 },
  fab: { position:'absolute', right:16, bottom:40, width:56, height:56, borderRadius:28, backgroundColor:'#007AFF', alignItems:'center', justifyContent:'center', elevation:4 }
});
