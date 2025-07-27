import CryptoJS from "crypto-js";
import { lazy, Suspense, useReducer, useState, useEffect } from 'react';
import BGDImage from './images/mata-mandir.jpg';
import './App.css';
const SignIn = lazy(() => import("./frontend/signin/SignIn"));
const Home = lazy(() => import("./frontend/home/Home"));
const URL = process.env.REACT_APP_API_URL;
const port = process.env.REACT_APP_PORT;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

const App = () => {
  const [isServerDown, setIsServerDown] = useState('Connecting...');
  const [images] = useState([
    { id: 11120, src: require('./images/11120.jpg') },
    { id: 1121, src: require('./images/1121.jpg') },
    { id: 112110, src: require('./images/112110.jpg') },
    { id: 1122, src: require('./images/1122.jpg') },
    { id: 11220, src: require('./images/11220.jpg') },
    { id: 11221, src: require('./images/11221.jpg') },
    { id: 112210, src: require('./images/112210.jpg') },
    { id: 11222, src: require('./images/11222.jpg') },
    { id: 111117, src: require('./images/111117.jpg') },
    { id: 111111, src: require('./images/111111.jpg') },
    { id: 111110, src: require('./images/111110.jpg') },
    { id: 1111130, src: require('./images/1111130.jpg') },
    { id: 1111110, src: require('./images/1111110.jpg') },
    { id: 11111114, src: require('./images/11111114.jpg') },
    { id: 11111142, src: require('./images/11111142.jpg') },
    { id: 111113, src: require('./images/111113.jpg') },
    { id: 111115, src: require('./images/111115.jpg') },
    { id: 1111150, src: require('./images/1111150.jpg') },
    { id: 1111152, src: require('./images/1111152.jpg') },
    { id: 11111520, src: require('./images/11111520.jpg') },
    { id: 11111521, src: require('./images/11111521.jpg') },
    { id: 1111153, src: require('./images/1111153.jpg') },
    { id: 11111530, src: require('./images/11111530.jpg') },
    { id: 11111531, src: require('./images/11111531.jpg') },
    { id: 11111532, src: require('./images/11111532.jpg') },
    { id: 111211, src: require('./images/111211.jpg') },
    { id: 111214, src: require('./images/111214.jpg') },
    { id: 111221, src: require('./images/111221.jpg') },
    { id: 1121111, src: require('./images/1121111.jpg') },
    { id: 11211110, src: require('./images/11211110.jpg') },
    { id: 112211, src: require('./images/112211.jpg') },
    { id: 1121114, src: require('./images/1121114.jpg') },
    { id: 1121243, src: require('./images/1121243.jpg') },
    { id: 111241, src: require('./images/111241.jpg') },
    { id: 1122122, src: require('./images/1122122.jpg') },
    { id: 11221220, src: require('./images/11221220.jpg') },
    { id: 1111112, src: require('./images/1111112.jpg') },
    { id: 11111120, src: require('./images/11111120.jpg') },
    { id: 1111113, src: require('./images/1111113.jpg') },
    { id: 11111132, src: require('./images/11111132.jpg') },
    { id: 111111210, src: require('./images/111111210.jpg') },
    { id: 111111211, src: require('./images/111111211.jpg') },
    { id: 1111133, src: require('./images/1111133.jpg') },
    { id: 11111330, src: require('./images/11111330.jpg') },
    { id: 11111331, src: require('./images/11111331.jpg') },
    { id: 11111332, src: require('./images/11111332.jpg') },
    { id: 11111123, src: require('./images/11111123.jpg') },
    { id: 1122111, src: require('./images/1122111.jpg') },
    { id: 1111131, src: require('./images/1111131.jpg') },
    { id: 1111132, src: require('./images/1111132.jpg') },
    { id: 1112131, src: require('./images/1112131.jpg') },
    { id: 1112132, src: require('./images/1112132.jpg') },
    { id: 1112133, src: require('./images/1112133.jpg') },
    { id: 1111124, src: require('./images/1111124.jpg') },
    { id: 11111240, src: require('./images/11111240.jpg') },
    { id: 11111241, src: require('./images/11111241.jpg') },
    { id: 11111242, src: require('./images/11111242.jpg') },
    { id: 111112, src: require('./images/111112.jpg') },
    { id: 1111120, src: require('./images/1111120.jpg') },
    { id: 1111123, src: require('./images/1111123.jpg') },
    { id: 11122130, src: require('./images/11122130.jpg') },
    { id: 1112210, src: require('./images/1112210.jpg') },
    { id: 1112211, src: require('./images/1112211.jpg') },
    { id: 1112213, src: require('./images/1112213.jpg') },
    { id: 11122122, src: require('./images/11122122.jpg') },
    { id: 11122131, src: require('./images/11122131.jpg') },
    { id: 1112212, src: require('./images/1112212.jpg') },
    { id: 11122121, src: require('./images/11122121.jpg') },
    { id: 111224, src: require('./images/111224.jpg') },
    { id: 11122, src: require('./images/11122.jpg') },
    { id: 111220, src: require('./images/111220.jpg') },
    { id: 111225, src: require('./images/111225.jpg') },
    { id: 11122120, src: require('./images/11122120.jpg') },
    { id: 111213, src: require('./images/111213.jpg') },
    { id: 1112130, src: require('./images/1112130.jpg') },
    { id: 1112134, src: require('./images/1112134.jpg') },
    { id: 11121340, src: require('./images/11121340.jpg') },
    { id: 11121341, src: require('./images/11121341.jpg') },
    { id: 1112140, src: require('./images/1112140.jpg') },
    { id: 11121410, src: require('./images/11121410.jpg') },
    { id: 11121411, src: require('./images/11121411.jpg') },
    { id: 11121412, src: require('./images/11121412.jpg') },
    { id: 11121, src: require('./images/11121.jpg') },
    { id: 111210, src: require('./images/111210.jpg') },
    { id: 111215, src: require('./images/111215.jpg') },
    { id: 111216, src: require('./images/111216.jpg') },
    { id: 111217, src: require('./images/111217.jpg') },
    { id: 1112141, src: require('./images/1112141.jpg') },
    { id: 1112142, src: require('./images/1112142.jpg') },
    { id: 11121420, src: require('./images/11121420.jpg') },
    { id: 11121421, src: require('./images/11121421.jpg') },
    { id: 11111122, src: require('./images/11111122.jpg') },
    { id: 11111131, src: require('./images/11111131.jpg') },
    { id: 11111140, src: require('./images/11111140.jpg') },
    { id: 11111114, src: require('./images/11111114.jpg') },
    { id: 11111142, src: require('./images/11111142.jpg') },
    { id: 11211143, src: require('./images/11211143.jpg') },
    { id: 112111, src: require('./images/112111.jpg') },
    { id: 1121110, src: require('./images/1121110.jpg') },
    { id: 11211113, src: require('./images/11211113.jpg') },
    { id: 1111114, src: require('./images/1111114.jpg') },
    { id: 11111141, src: require('./images/11111141.jpg') },
    { id: 1112121, src: require('./images/1112121.jpg') },
    { id: 11121210, src: require('./images/11121210.jpg') },
    { id: 11121211, src: require('./images/11121211.jpg') },
    { id: 11121212, src: require('./images/11121212.jpg') },
    { id: 1112122, src: require('./images/1112122.jpg') },
    { id: 11121220, src: require('./images/11121220.jpg') },
    { id: 11121221, src: require('./images/11121221.jpg') },
    { id: 11121222, src: require('./images/11121222.jpg') },
    { id: 1112123, src: require('./images/1112123.jpg') },
    { id: 11121230, src: require('./images/11121230.jpg') },
    { id: 11121231, src: require('./images/11121231.jpg') },
    { id: 11121232, src: require('./images/11121232.jpg') },
    { id: 1112124, src: require('./images/1112124.jpg') },
    { id: 1112125, src: require('./images/1112125.jpg') },
    { id: 111212, src: require('./images/111212.jpg') },
    { id: 1112120, src: require('./images/1112120.jpg') },
    { id: 111111212, src: require('./images/111111212.jpg') },
    { id: 1121221, src: require('./images/1121221.jpg') },
    { id: 11212210, src: require('./images/11212210.jpg') },
    { id: 11212211, src: require('./images/11212211.jpg') },
    { id: 11212212, src: require('./images/11212212.jpg') },
    { id: 11212213, src: require('./images/11212213.jpg') },
    { id: 11221211, src: require('./images/11221211.jpg') },
    { id: 1122120, src: require('./images/1122120.jpg') },
    { id: 112212, src: require('./images/112212.jpg') },
    { id: 112213, src: require('./images/112213.jpg') },
    { id: 1122121, src: require('./images/1122121.jpg') },
    { id: 11111121, src: require('./images/11111121.jpg') },
    { id: 1112110, src: require('./images/1112110.jpg') },
    { id: 1112111, src: require('./images/1112111.jpg') },
    { id: 1112112, src: require('./images/1112112.jpg') },
    { id: 11121110, src: require('./images/11121110.jpg') },
    { id: 11121111, src: require('./images/11121111.jpg') },
    { id: 11121112, src: require('./images/11121112.jpg') },
    { id: 11121120, src: require('./images/11121120.jpg') },
    { id: 11121121, src: require('./images/11121121.jpg') },
    { id: 11121122, src: require('./images/11121122.jpg') },
    { id: 11212, src: require('./images/11212.jpg') },
    { id: 112120, src: require('./images/112120.jpg') },
    { id: 112123, src: require('./images/112123.jpg') },
    { id: 1121230, src: require('./images/1121230.jpg') },
    { id: 1121236, src: require('./images/1121236.jpg') },
    { id: 1121238, src: require('./images/1121238.jpg') },
    { id: 11212360, src: require('./images/11212360.jpg') },
    { id: 112124, src: require('./images/112124.jpg') },
    { id: 1121240, src: require('./images/1121240.jpg') },
    { id: 11212430, src: require('./images/11212430.jpg') },
    { id: 11212431, src: require('./images/11212431.jpg') },
    { id: 11212432, src: require('./images/11212432.jpg') },
    { id: 11123, src: require('./images/11123.jpg') },
    { id: 111230, src: require('./images/111230.jpg') },
    { id: 111231, src: require('./images/111231.jpg') },
    { id: 1112310, src: require('./images/1112310.jpg') },
    { id: 1112311, src: require('./images/1112311.jpg') },
    { id: 1112312, src: require('./images/1112312.jpg') },
    { id: 11123120, src: require('./images/11123120.jpg') },
    { id: 11123121, src: require('./images/11123121.jpg') },
    { id: 1112313, src: require('./images/1112313.jpg') },
    { id: 1112314, src: require('./images/1112314.jpg') },
    { id: 111233, src: require('./images/111233.jpg') },
    { id: 111234, src: require('./images/111234.jpg') },
    { id: 1112340, src: require('./images/1112340.jpg') },
    { id: 1112341, src: require('./images/1112341.jpg') },
    { id: 111232, src: require('./images/111232.jpg') },
    { id: 1112320, src: require('./images/1112320.jpg') },
    { id: 1112321, src: require('./images/1112321.jpg') },
    { id: 1112322, src: require('./images/1112322.jpg') },
    { id: 112122, src: require('./images/112122.jpg') },
    { id: 1121223, src: require('./images/1121223.jpg') },
    { id: 1121224, src: require('./images/1121224.jpg') },
    { id: 111114, src: require('./images/111114.jpg') },
    { id: 111116, src: require('./images/111116.jpg') },
    { id: 111118, src: require('./images/111118.jpg') },
    { id: 11112, src: require('./images/11112.jpg') },
    { id: 11111130, src: require('./images/11111130.jpg') },
    { id: 111218, src: require('./images/111218.jpg') },
    { id: 1112113, src: require('./images/1112113.jpg') },
    { id: 1112114, src: require('./images/1112114.jpg') },
    { id: 11221210, src: require('./images/11221210.jpg') },
    { id: 11211140, src: require('./images/11211140.jpg') },
    { id: 11211141, src: require('./images/11211141.jpg') },
    { id: 11211142, src: require('./images/11211142.jpg') },
    { id: 1121220, src: require('./images/1121220.jpg') },
    { id: 1121222, src: require('./images/1121222.jpg') },
    { id: 11212220, src: require('./images/11212220.jpg') },
    { id: 11212221, src: require('./images/11212221.jpg') },
    { id: 11212222, src: require('./images/11212222.jpg') },
    { id: 11125, src: require('./images/11125.jpg') },
    { id: 1122110, src: require('./images/1122110.jpg') },
    { id: 11111115, src: require('./images/11111115.jpg') },
    { id: 11111116, src: require('./images/11111116.jpg') },
    { id: 11111117, src: require('./images/11111117.jpg') },
    { id: 1121242, src: require('./images/1121242.jpg') },
    { id: 1121234, src: require('./images/1121234.jpg') },
    { id: 1121231, src: require('./images/1121231.jpg') },
    { id: 1121233, src: require('./images/1121233.jpg') },
    { id: 1121237, src: require('./images/1121237.jpg') },
    { id: 11126, src: require('./images/11126.jpg') },
    { id: 112125, src: require('./images/112125.jpg') },
    { id: 112128, src: require('./images/112128.jpg') },
    { id: 1121250, src: require('./images/1121250.jpg') },
    { id: 1121251, src: require('./images/1121251.jpg') },
    { id: 11212510, src: require('./images/11212510.jpg') },
    { id: 11212511, src: require('./images/11212511.jpg') },
    { id: 11212512, src: require('./images/11212512.jpg') },
    { id: 11212513, src: require('./images/11212513.jpg') },
    { id: 1111121, src: require('./images/1111121.jpg') },
    { id: 11111210, src: require('./images/11111210.jpg') },
    { id: 11111211, src: require('./images/11111211.jpg') },
    { id: 11111212, src: require('./images/11111212.jpg') },
    { id: 111112120, src: require('./images/111112120.jpg') },
    { id: 1111122, src: require('./images/1111122.jpg') },
    { id: 11111220, src: require('./images/11111220.jpg') },
    { id: 11111221, src: require('./images/11111221.jpg') },
    { id: 11111222, src: require('./images/11111222.jpg') },
    { id: 111112220, src: require('./images/111112220.jpg') },
    { id: 111112221, src: require('./images/111112221.jpg') },
    { id: 11111223, src: require('./images/11111223.jpg') },
    { id: 11111224, src: require('./images/11111224.jpg') },
    { id: 112121, src: require('./images/112121.jpg') },
    { id: 1121210, src: require('./images/1121210.jpg') },
    { id: 1121211, src: require('./images/1121211.jpg') },
    { id: 11212110, src: require('./images/11212110.jpg') },
    { id: 11212111, src: require('./images/11212111.jpg') },
    { id: 11212112, src: require('./images/11212112.jpg') },
    { id: 11212113, src: require('./images/11212113.jpg') },
    { id: 1122112, src: require('./images/1122112.jpg') },
    { id: 11221120, src: require('./images/11221120.jpg') },
    { id: 112126, src: require('./images/112126.jpg') },
    { id: 112127, src: require('./images/112127.jpg') },
    { id: 111223, src: require('./images/111223.jpg') },
    { id: 1112230, src: require('./images/1112230.jpg') },
    { id: 1112231, src: require('./images/1112231.jpg') },
    { id: 1112232, src: require('./images/1112232.jpg') },
    { id: 111222, src: require('./images/111222.jpg') },
    { id: 1112220, src: require('./images/1112220.jpg') },
    { id: 1112221, src: require('./images/1112221.jpg') },
    { id: 1112222, src: require('./images/1112222.jpg') },
    { id: 11122220, src: require('./images/11122220.jpg') },
    { id: 11122221, src: require('./images/11122221.jpg') },
    { id: 1112223, src: require('./images/1112223.jpg') },
    { id: 11122230, src: require('./images/11122230.jpg') },
    { id: 1121213, src: require('./images/1121213.jpg') },
    { id: 11212130, src: require('./images/11212130.jpg') },
    { id: 11212131, src: require('./images/11212131.jpg') },
    { id: 11212132, src: require('./images/11212132.jpg') },
    { id: 1121214, src: require('./images/1121214.jpg') },
    { id: 11212140, src: require('./images/11212140.jpg') },
    { id: 11212141, src: require('./images/11212141.jpg') },
    { id: 1121232, src: require('./images/1121232.jpg') },
    { id: 1121235, src: require('./images/1121235.jpg') },
    { id: 11211151, src: require('./images/11211151.jpg') },
    { id: 112111510, src: require('./images/112111510.jpg') },
    { id: 1121112, src: require('./images/1121112.jpg') },
    { id: 11211120, src: require('./images/11211120.jpg') },
    { id: 11211121, src: require('./images/11211121.jpg') },
    { id: 11211122, src: require('./images/11211122.jpg') },
    { id: 11211123, src: require('./images/11211123.jpg') },
    { id: 11211124, src: require('./images/11211124.jpg') },
    { id: 112111240, src: require('./images/112111240.jpg') },
    { id: 1111111, src: require('./images/1111111.jpg') },
    { id: 1121115, src: require('./images/1121115.jpg') },
    { id: 11211150, src: require('./images/11211150.jpg') },
    { id: 112111241, src: require('./images/112111241.jpg') },
    { id: 112111242, src: require('./images/112111242.jpg') },
    { id: 1121212, src: require('./images/1121212.jpg') },
    { id: 11212120, src: require('./images/11212120.jpg') },
    { id: 11212121, src: require('./images/11212121.jpg') },
    { id: 11212122, src: require('./images/11212122.jpg') },
    { id: 11211112, src: require('./images/11211112.jpg') },
    { id: 112111120, src: require('./images/112111120.jpg') },
    { id: 112111121, src: require('./images/112111121.jpg') },
    { id: 11124, src: require('./images/11124.jpg') },
    { id: 111240, src: require('./images/111240.jpg') },
    { id: 111241, src: require('./images/111241.jpg') },
    { id: 111243, src: require('./images/111243.jpg') },
    { id: 111244, src: require('./images/111244.jpg') },
    { id: 1112440, src: require('./images/1112440.jpg') },
    { id: 1112441, src: require('./images/1112441.jpg') },
    { id: 1112442, src: require('./images/1112442.jpg') },
    { id: 1112443, src: require('./images/1112443.jpg') },
    { id: 111245, src: require('./images/111245.jpg') },
    { id: 111246, src: require('./images/111246.jpg') },
    { id: 1111111, src: require('./images/1111111.jpg') },
    { id: 11111110, src: require('./images/11111110.jpg') },
    { id: 11111111, src: require('./images/11111111.jpg') },
    { id: 11111112, src: require('./images/11111112.jpg') },
    { id: 11111113, src: require('./images/11111113.jpg') },
    { id: 111111130, src: require('./images/111111130.jpg') },
    { id: 111111131, src: require('./images/111111131.jpg') },
    { id: 111111132, src: require('./images/111111132.jpg') },
    { id: 11211111, src: require('./images/11211111.jpg') },
    { id: 112111110, src: require('./images/112111110.jpg') },
    { id: 112111111, src: require('./images/112111111.jpg') },
    { id: 112111112, src: require('./images/112111112.jpg') },
    { id: 112111130, src: require('./images/112111130.jpg') },
    { id: 112111131, src: require('./images/112111131.jpg') },
    { id: 112111132, src: require('./images/112111132.jpg') },
    { id: 11211114, src: require('./images/11211114.jpg') },
    { id: 1121215, src: require('./images/1121215.jpg') },
    { id: 1121216, src: require('./images/1121216.jpg') },
    { id: 1121217, src: require('./images/1121217.jpg') },
    { id: 11211152, src: require('./images/11211152.jpg') },
    { id: 1121113, src: require('./images/1121113.jpg') },
    { id: 11211130, src: require('./images/11211130.jpg') },
    { id: 11211131, src: require('./images/11211131.jpg') },
    { id: 11211132, src: require('./images/11211132.jpg') },
    { id: 11211133, src: require('./images/11211133.jpg') },
    { id: 11211134, src: require('./images/11211134.jpg') },
    { id: 112111330, src: require('./images/112111330.jpg') },
    { id: 112111331, src: require('./images/112111331.jpg') },
    { id: 112111332, src: require('./images/112111332.jpg') },
    { id: 112111340, src: require('./images/112111340.jpg') },
    { id: 112111341, src: require('./images/112111341.jpg') },
    { id: 112111342, src: require('./images/112111342.jpg') },
    { id: 1121116, src: require('./images/1121116.jpg') },
    { id: 1121117, src: require('./images/1121117.jpg') },
    { id: 1121241, src: require('./images/1121241.jpg') },    
    { id: 1121252, src: require('./images/1121252.jpg') },    
    { id: 1121253, src: require('./images/1121253.jpg') },    
    { id: 1121244, src: require('./images/1121244.jpg') }, 
    { id: 112112, src: require('./images/112112.jpg') }, 
    { id: 112113, src: require('./images/112113.jpg') }, 
    { id: 11214, src: require('./images/11214.jpg') }, 
    { id: 111242, src: require('./images/111242.jpg') }, 
    { id: 1116, src: require('./images/1116.jpg') }, 
    { id: 11123122, src: require('./images/11123122.jpg') },
    { id: 1111151, src: require('./images/1111151.jpg') },
    { id: 11213, src: require('./images/11213.jpg') },
    { id: 111111320, src: require('./images/111111320.jpg') },
    { id: 112122120, src: require('./images/112122120.jpg') },
    { id: 112122130, src: require('./images/112122130.jpg') },
    { id: 11221221, src: require('./images/11221221.jpg') },
    { id: 111112121, src: require('./images/111112121.jpg') },
    // { id: 211211111121322080, src: require('./images/211211111121322080.jpg') },
  ]);
  const [members, setMembers] = useState([]);
  const [englishToHindi, setEnglishToHindi] = useState();
  const initialState = {
    user: undefined,
    users: [],
    images: [],
    dulania: [],
    moruwa: [],
    tatija: [],
    members: [],
    villages: [],
    village: '',
    filters: {
      search: '',
      male: {
        village: '',
        gotra: ''
      },
      female: {
        village: '',
        gotra: ''
      }
    },
    newUser: {
      username: '',
      password: '',
      role: 'user',
      error: false
    },
    newMember: {
      type: '',
      name: '',
      mobile: '',
      email: '',
      date: '',
      month: '',
      year: '',
      dateDeath: '',
      monthDeath: '',
      yearDeath: '',
      isAlive: 'alive',
      gender: 'M',
      village: '',
      gotra: ''
    },
    input: {
      username: '',
      password: '',
      error: false
    },
    editInput: {
      id: '',
      name: '',
      mobile: '',
      date: '',
      month: '',
      year: '',
      dateDeath: '',
      monthDeath: '',
      yearDeath: '',
      gender: '',
      village: '',
      gotra: '',
      email: '',
      isAlive: ''
    },
    memberToBeDisplayed: '',
    memberToBeAdded: '',
    memberToBeEdited: '',
    isUserAddOpen: false,
    isMemberDisplayOpen: false,
    isUserEditOpen: false,
    isMemberAddOpen: false,
    isMemberEditOpen: false
  }
  // traverse to add a member
  const addMember = (tree, id, member, type) => {
    if (!tree) return null;
    if (tree.id === id && type === 'child') {
      if (tree.children) {
        tree.children.push(member);
      } else {
        tree.children = [member];
      }
      return tree;
    }
    else if(tree.id === id && type === 'wife') {
      if (tree.wives) {
        tree.wives.push(member);
      } else {
        tree.wives = [member]
      }
      return tree;
    }
    tree.children?.forEach(child => addMember(child, id, member, type));
    return tree;
  }
  // traverse to edit a member
  const editMemberById = (tree, member) => {
    if (!tree) return null;
    if (tree.id === member.id) {
      tree.name = member.name;
      tree.gender = member.gender;
      tree.isAlive = member.isAlive;
      tree.dob = member.dob;
      tree.dod = member.dod;
      tree.village = member.village;
      tree.gotra = member.gotra;
      tree.email = member.email;
      tree.mobile = member.mobile;
    }
    if (tree.children) {
      tree.children = tree.children.map(child => {
        if(child.id === member.id) {
          child.name = member.name;
          child.gender = member.gender;
          child.isAlive = member.isAlive;
          child.dob = member.dob;
          child.dod = member.dod;
          child.village = member.village;
          child.gotra = member.gotra;
          child.email = member.email;
          child.mobile = member.mobile;
        }
        return child;
      });
    }
    tree.children?.forEach(child => editMemberById(child, member));
    if(tree.wives) {
      tree.wives = tree.wives.map(wife => {
        if(wife.id === member.id) {
          wife.name = member.name;
          wife.gender = member.gender;
          wife.isAlive = member.isAlive;
          wife.dob = member.dob;
          wife.dod = member.dod;
          wife.village = member.village;
          wife.gotra = member.gotra;
          wife.email = member.email;
          wife.mobile = member.mobile;
        }
        return wife;
      });      
    }
    tree.wives?.forEach(wife => editMemberById(wife, member));
    return tree;
  };
  // traverse to delete a member
  const deleteMemberById = (tree, id) => {
    if (!tree) return null;
    if (tree.children) {
      tree.children = tree.children.filter(child => child.id !== id);
    }
    tree.children?.forEach(child => deleteMemberById(child, id));
    if(tree.wives) {
      tree.wives = tree.wives.filter(wife => wife.id !== id);      
    }
    tree.wives?.forEach(wife => deleteMemberById(wife, id));
    return tree;
  };
  // traverse members to expand or collapse
  const traverseMemberToExpandOrCollapse = (member, id) => {
    if(member.id === id && member.gender === 'M') {
      member.isCollapsed = !member.isCollapsed
    }
    member.children?.map(child => traverseMemberToExpandOrCollapse(child, id))
    return member;
  }
  // traverse members to either expand all or collapse all
  const traverseMemberToExpandOrCollapseAll = (member, flag) => {
    member.isCollapsed = flag
    member.gender === 'M' && member.children?.map(child => traverseMemberToExpandOrCollapseAll(child, flag))
    return member;
  }
  // convert english to hindi text
  const getHindiText = (text, attribute) => {
    return text?.length
      ? text
        ?.split(" ")
        .map(
          (word) =>
            (attribute === "village"
              ? englishToHindi.villages[word.toLowerCase()]
              : attribute === "gotra"
                ? englishToHindi.gotras[word.toLowerCase()]
                : attribute === "months"
                  ? englishToHindi.months[word.toLowerCase()]
                  : englishToHindi.names[word.toLowerCase()]
            ) || word,
        )
        .join(" ")
      : "";
  };
  // convert english to hindi numbers
  const getHindiNumbers = (text) => {
    const len = text.length;
    let result = "";
    for (let i = 0; i < len; i++) {
      result += englishToHindi.numbers[text.charAt(i)];
    }
    return result;
  };
  // get village members
  const traverseMaleVillageMembers = (members, village) => {
    let result = [];
    for (const member of members) {
      if (member.wives?.length && member.wives[0].village === village) {
        result.push(member);
      }
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseMaleVillageMembers(member.children, village));
      }
    }
    return result;
  };
  // get village members
  const traverseFemaleVillageMembers = (members, village) => {
    let result = [];
      for (const member of members) {
      if (member.gender === 'F' && member.gotra !== undefined && member.village === village) {
        result.push(member);
      }  
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseFemaleVillageMembers(member.children, village));
      }
    }  
    return result;
  };
  // get gotra members
  const traverseMaleGotraMembers = (members, gotra) => {
    let result = [];  
    for (const member of members) {
      if (member.wives?.length && member.wives[0].gotra === gotra) {
        result.push(member);
      }  
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseMaleGotraMembers(member.children, gotra));
      }
    }  
    return result;
  };
  const traverseFemaleGotraMembers = (members, gotra) => {
    let result = [];  
    for (const member of members) {
      if (member.gender === 'F' && member.village !== undefined && member.gotra === gotra) {
        result.push(member);
      }  
      if (member.gender === 'M' && member.children?.length) {
        result = result.concat(traverseFemaleGotraMembers(member.children, gotra));
      }
    }  
    return result;
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case 'fetch_success':
        const db = action.initialState;
        const updatedMembersOnReload = action.village === 'dulania' ? db.dulania : action.village === 'moruwa' ? db.moruwa : action.village === 'tatija' ? db.tatija : []
        setMembers(updatedMembersOnReload);
        return {
          user: action.user,
          users: db.users,
          dulania: db.dulania,
          moruwa: db.moruwa,
          tatija: db.tatija,
          members: updatedMembersOnReload,
          villages: db.villages,
          village: action.village,
          images: images,
          filters: {
            search: '',
            male: {
              village: '',
              gotra: ''
            },
            female: {
              village: '',
              gotra: ''
            }
          },
          newUser: state.newUser,
          newMember: state.newMember,
          input: state.input,
          editInput: state.editInput,
          memberToBeDisplayed: state.memberToBeDisplayed,
          memberToBeAdded: state.memberToBeAdded,
          memberToBeEdited: state.memberToBeEdited,
          isUserAddOpen: state.isUserAddOpen,
          isMemberDisplayOpen: state.isMemberDisplayOpen,
          isUserEditOpen: state.isUserEditOpen,
          isMemberAddOpen: state.isMemberAddOpen,
          isMemberEditOpen: state.isMemberEditOpen
        };
      case 'openUserEdit':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: false,
          isUserEditOpen: true
        };
      case 'closeUserEdit':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: false,
          isUserEditOpen: false
        };
      case 'addNewUser':
        return {
          ...state,
          users: [...state.users, action.newUser],
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserEditOpen: false
        };
      case 'deleteUser':
        return {
          ...state,
          users: state.users.filter(user => user.username !== action.username),
          isUserEditOpen: false
        };
      case 'openMemberAdd':
        return {
          ...state,
          newMember: {
            type: '',
            name: '',
            mobile: '',
            email: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            isAlive: 'alive',
            gender: 'M',
            village: '',
            gotra: ''
          },
          memberToBeAdded: action.member,
          memberToBeEdited: '',
          isMemberAddOpen: true
        };
      case 'closeMemberAdd':
        return {
          ...state,
          newMember: {
            type: '',
            name: '',
            mobile: '',
            email: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            isAlive: 'alive',
            gender: 'M',
            village: '',
            gotra: ''
          },
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'openMemberEdit':
        return {
          ...state,
          editInput: {
            id: action.member.id,
            name: action.member.name ? action.member.name : '',
            mobile: action.member.mobile && action.member.mobile.length ? action.member.mobile.toString().replaceAll(',', ', ') : '',
            date: action.member.dob ? action.member.dob.split(' ')[0] : '',
            month: action.member.dob ? action.member.dob.split(' ')[1] : '',
            year: action.member.dob ? action.member.dob.split(' ')[2] : '',
            dateDeath: action.member.dod ? action.member.dod.split(' ')[0] : '',
            monthDeath: action.member.dod ? action.member.dod.split(' ')[1] : '',
            yearDeath: action.member.dod ? action.member.dod.split(' ')[2] : '',
            gender: action.member.gender ? action.member.gender : '',
            village: action.member.village ? action.member.village : '',
            gotra: action.member.gotra ? action.member.gotra : '',
            isAlive: action.member.isAlive ? 'alive' : 'dead',
            email: action.member.email && action.member.email.length ? action.member.email.toString().replaceAll(',', ', ') : ''
          },
          memberToBeEdited: action.member,
          isMemberEditOpen: true
        };
      case 'closeMemberEdit':
        return {
          ...state,
          editInput: {
            id: '',
            name: '',
            mobile: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            gender: '',
            village: '',
            gotra: '',
            email: '',
            isAlive: ''
          },
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'addMember':
        const updatedMembersPostAddMember = state.members.map(member => addMember(member, state.memberToBeAdded.id, action.member, action.memberType))
        setMembers(updatedMembersPostAddMember);
        return {
          ...state,
          members: updatedMembersPostAddMember,
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'editMember':
        const updatedMembersPostEditMember = state.members.map(member => editMemberById(member, action.member));
        setMembers(updatedMembersPostEditMember);
        return {
          ...state,
          members: updatedMembersPostEditMember,
          editInput: {
            id: '',
            name: '',
            mobile: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            gender: '',
            village: '',
            gotra: '',
            email: '',
            isAlive: ''
          },
          memberToBeAdded: '',
          memberToBeEdited: '',
          isMemberAddOpen: false,
          isMemberEditOpen: false
        };
      case 'deleteMember':
      const updatedMembersPostDeleteMember = state.members.map(member => deleteMemberById(member, action.id));
      setMembers(updatedMembersPostDeleteMember);
      return {
        ...state,
        members: updatedMembersPostDeleteMember,
        memberToBeDisplayed: '',
        memberToBeAdded: '',
        memberToBeEdited: '',
        isMemberDisplayOpen: false,
        isMemberAddOpen: false,
        isMemberEditOpen: false
      };
      case 'editInputNewMember':
        return {
          ...state,
          newMember: {
            ...state.newMember,
            [action.attribute]: action.value
          }
        };
      case 'editInputNewUser':
        return {
          ...state,
          newUser: {
            ...state.newUser,
            [action.attribute]: action.value
          }
        };
      case 'openAddNewUser':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: true
        };
      case 'closeAddNewUser':
        return {
          ...state,
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          isUserAddOpen: false
        };
      case 'input':
        return {
          ...state,
          input: {
            ...state.input,
            [action.attribute]: action.value
          }
        };
      case 'editInput':
        return {
          ...state,
          editInput: {
            ...state.editInput,
            [action.attribute]: action.value
          }
        };
      case 'signin':
        const error = state.users.find(user => user.username === state.input.username && user.password === state.input.password)
        if(error) {
          setMembers(state.dulania);
          return {
            ...state,
            user: {
              username: state.input.username,
              password: state.input.password,
              role: state.users.find(user => user.username === state.input.username).role,
              language: false
            },
            village: 'dulania',
            members: state.dulania,
            input: {
              username: '',
              password: '',
              error: false
            },
            newUser: {
              username: '',
              password: '',
              role: 'user',
              error: false
            },
            newMember: {
              type: '',
              name: '',
              mobile: '',
              email: '',
              date: '',
              month: '',
              year: '',
              dateDeath: '',
              monthDeath: '',
              yearDeath: '',
              isAlive: 'alive',
              gender: 'M',
              village: '',
              gotra: ''
            },
            editInput: {
              id: '',
              name: '',
              mobile: '',
              date: '',
              month: '',
              year: '',
              dateDeath: '',
              monthDeath: '',
              yearDeath: '',
              gender: '',
              village: '',
              gotra: '',
              email: '',
              isAlive: ''
            }
          };
        } else {
          return {
            ...state,
            input: {
              ...state.input,
              error: true
            }
          }
        };
      case 'signout':
        sessionStorage.removeItem('appState');
        setMembers([]);
        return {
          ...state,
          user: undefined,
          filters: {
            search: '',
            male: {
              village: '',
              gotra: ''
            },
            female: {
              village: '',
              gotra: ''
            }
          },
          input: {
            username: '',
            password: '',
            error: false
          },
          newUser: {
            username: '',
            password: '',
            role: 'user',
            error: false
          },
          newMember: {
            type: '',
            name: '',
            mobile: '',
            email: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            isAlive: 'alive',
            gender: 'M',
            village: '',
            gotra: ''
          },
          editInput: {
            id: '',
            name: '',
            mobile: '',
            date: '',
            month: '',
            year: '',
            dateDeath: '',
            monthDeath: '',
            yearDeath: '',
            gender: '',
            village: '',
            gotra: '',
            email: '',
            isAlive: ''
          },
          memberToBeDisplayed: '',
          memberToBeAdded: '',
          memberToBeEdited: '',
          isUserAddOpen: false,
          isMemberDisplayOpen: false,
          isUserEditOpen: false,
          isMemberAddOpen: false,
          isMemberEditOpen: false,
        };
      case 'toggle':
        return {
          ...state,
          members: state.members.map(member => traverseMemberToExpandOrCollapse(member, action.id))
        };
      case 'toggle-all':
        return {
          ...state,
          members: state.members.map(member => traverseMemberToExpandOrCollapseAll(member, action.flag))
        };
      case 'language':
        return {
          ...state,
          user: {
            ...state.user,
            language: action.flag
          }
        };
      case 'village':
        const updatedMembersPostVillageChange = action.village === 'dulania' ? state.dulania : action.village === 'moruwa' ? state.moruwa : action.village === 'tatija' ? state.tatija : [];
        setMembers(updatedMembersPostVillageChange);
        return {
          ...state,
          members: updatedMembersPostVillageChange,
          village: action.village
        };
      case 'male-selection':
        return {
          ...state,
          members: action.village ? traverseMaleVillageMembers(members, action.village) : action.gotra ? traverseMaleGotraMembers(members, action.gotra) : members,
          filters: {
            male: {
              village: action.village,
              gotra: action.gotra
            },
            female: {
              village: '',
              gotra: ''
            }
          }
        };
      case 'female-selection':
        return {
          ...state,
          members: action.village ? traverseFemaleVillageMembers(members, action.village) : action.gotra ? traverseFemaleGotraMembers(members, action.gotra) : members,
          filters: {
            male: {
              village: '',
              gotra: ''
            },
            female: {
              village: action.village,
              gotra: action.gotra
            }
          }
        };
      case 'openMemberDisplay':
        return {
          ...state,
          isMemberDisplayOpen: true,
          memberToBeDisplayed: action.member,
          memberToBeAdded: '',
          memberToBeEdited: '',
        };
      case 'closeMemberDisplay':
        return {
          ...state,
          isMemberDisplayOpen: false,
          memberToBeDisplayed: '',
          memberToBeAdded: '',
          memberToBeEdited: '',
        };
      default:
        return state;
    }
  }
  const fetchData = async (user, village) => {
    try {
      const response = await fetch(`${URL}:${port}/getData`);
      const data = await response.text();
      const db = decryptData(data);
      sessionStorage.setItem('appState', JSON.stringify({
        user: user,
        users: db.users,
        dulania: db.dulania,
        moruwa: db.moruwa,
        tatija: db.tatija,
        members: db.dulania,
        villages: db.villages,
        // images: db.images,
        village: village,
        filters: {
          search: '',
          male: {
            village: '',
            gotra: ''
          },
          female: {
            village: '',
            gotra: ''
          }
        },
        input: {
          username: '',
          password: '',
          error: false
        },
        newUser: {
          username: '',
          password: '',
          role: 'user',
          error: false
        },
        newMember: {
          type: '',
          name: '',
          mobile: '',
          email: '',
          date: '',
          month: '',
          year: '',
          dateDeath: '',
          monthDeath: '',
          yearDeath: '',
          isAlive: 'alive',
          gender: 'M',
          village: '',
          gotra: ''
        },
        editInput: {
          id: '',
          name: '',
          mobile: '',
          date: '',
          month: '',
          year: '',
          dateDeath: '',
          monthDeath: '',
          yearDeath: '',
          gender: '',
          village: '',
          gotra: '',
          email: '',
          isAlive: ''
        },
        memberToBeDisplayed: '',
        memberToBeAdded: '',
        memberToBeEdited: '',
        isUserAddOpen: false,
        isMemberDisplayOpen: false,
        isUserEditOpen: false,
        isMemberAddOpen: false,
        isMemberEditOpen: false
      }));
      setEnglishToHindi(db.englishToHindi);
      setIsServerDown('');
      dispatch({ type: 'fetch_success', initialState: db, user: user, village: village });
    } catch (error) {
      setIsServerDown('Server down. Please try again later.');
      dispatch({ type: 'fetch_error', initialState: {}, user: user });
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const storedState = sessionStorage.getItem('appState');
    return storedState ? JSON.parse(storedState) : initial;
  });
  useEffect(() => {
    const storedState = sessionStorage.getItem('appState');
    if(storedState) {
      fetchData(JSON.parse(storedState).user, JSON.parse(storedState).village);
    } else {
      fetchData(undefined, 'dulania');
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem('appState', JSON.stringify(state));
  }, [state]);
  const info = <div style={{ padding: '1rem 2rem', borderRadius: '7px', backgroundColor: isServerDown === 'Connecting...' ? 'lightgreen' : 'lightpink' }}>{isServerDown}</div>;
  return (
    <div className="app">
      { isServerDown !== '' ?
      info :
      <Suspense fallback={<div style={{ padding: '1rem 2rem', borderRadius: '7px', backgroundColor: 'lightgrey'}}>Please wait...</div>}>
        {
          state.user ?
          <Home
            state={state} 
            dispatch={dispatch} 
            members={members}
            getHindiText={getHindiText} 
            getHindiNumbers={getHindiNumbers}
          /> :
          <SignIn state={state} dispatch={dispatch} />
        }
      </Suspense> }
      <img className="bgd-image" src={BGDImage} alt="mata" />
    </div>
  );
}

export default App;
