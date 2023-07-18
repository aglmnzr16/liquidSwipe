/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {View} from 'react-native';
import {} from './source/components';
import LiquidSwipe from './source/components/LiquidSwipe';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LiquidSwipe />
    </GestureHandlerRootView>
  )

}
export default App;
