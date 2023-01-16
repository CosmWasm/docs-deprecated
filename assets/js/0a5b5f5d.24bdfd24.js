"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[2186],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var a=n(7294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=a.createContext({}),p=function(e){var t=a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},c=function(e){var t=p(e.components);return a.createElement(u.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,u=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),d=p(n),m=r,k=d["".concat(u,".").concat(m)]||d[m]||s[m]||i;return n?a.createElement(k,l(l({ref:t},c),{},{components:n})):a.createElement(k,l({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=d;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var p=2;p<i;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},6578:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>l,default:()=>s,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var a=n(7462),r=(n(7294),n(3905));const i={sidebar_position:7},l="Math",o={unversionedId:"smart-contracts/math",id:"smart-contracts/math",title:"Math",description:"The math functions used by cosmwasm are based upon standard rust, but helper functions are provided for u128, u64 and",source:"@site/docs/04-smart-contracts/07-math.md",sourceDirName:"04-smart-contracts",slug:"/smart-contracts/math",permalink:"/docs/smart-contracts/math",draft:!1,tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"defaultSidebar",previous:{title:"Events",permalink:"/docs/smart-contracts/events"},next:{title:"Compilation",permalink:"/docs/smart-contracts/compilation"}},u={},p=[{value:"Uint128",id:"uint128",level:2},{value:"checked",id:"checked",level:3},{value:"saturating",id:"saturating",level:3},{value:"wrapping",id:"wrapping",level:3},{value:"Uint64",id:"uint64",level:2},{value:"checked",id:"checked-1",level:3},{value:"saturating",id:"saturating-1",level:3},{value:"wrapping",id:"wrapping-1",level:3},{value:"Decimal",id:"decimal",level:2}],c={toc:p};function s(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"math"},"Math"),(0,r.kt)("p",null,"The math functions used by cosmwasm are based upon standard rust, but helper functions are provided for u128, u64 and\ndecimals."),(0,r.kt)("h2",{id:"uint128"},"Uint128"),(0,r.kt)("p",null,"A thin wrapper around u128 that is using strings for JSON encoding/decoding, such that the full u128 range can be used\nfor clients that convert JSON numbers to floats, like JavaScript and jq."),(0,r.kt)("p",null,"Including in file:\n",(0,r.kt)("inlineCode",{parentName:"p"},"use cosmwasm_std::Uint128;")),(0,r.kt)("p",null,"Use ",(0,r.kt)("inlineCode",{parentName:"p"},"from")," to create instances of this and ",(0,r.kt)("inlineCode",{parentName:"p"},"u128")," to get the value out:"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint128(number)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint128::new(number)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint128::from(number u128/u64/u32/u16/u8)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},'Uint128::try_from("34567")')),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint128::zero()")),(0,r.kt)("h3",{id:"checked"},"checked"),(0,r.kt)("p",null,"All the checked math functions work with Unit128 variables: checked_add, checked_sub, checked_mul, checked_div,\nchecked_div_euclid, checked_rem"),(0,r.kt)("h3",{id:"saturating"},"saturating"),(0,r.kt)("p",null,"All the saturating math functions work with Unit128 variables: saturating_add, saturating_sub, saturating_mul,\nsaturating_pow"),(0,r.kt)("h3",{id:"wrapping"},"wrapping"),(0,r.kt)("p",null,"All the wrapping math functions work with Unit128 variables: wrapping_add, wrapping_sub, wrapping_mul, wrapping_pow"),(0,r.kt)("h2",{id:"uint64"},"Uint64"),(0,r.kt)("p",null,"A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for\nclients that convert JSON numbers to floats, like JavaScript and jq."),(0,r.kt)("p",null,"Including in file:\n",(0,r.kt)("inlineCode",{parentName:"p"},"use cosmwasm_std::Uint64;")),(0,r.kt)("p",null,"Use ",(0,r.kt)("inlineCode",{parentName:"p"},"from")," to create instances of this and ",(0,r.kt)("inlineCode",{parentName:"p"},"u64")," to get the value out:"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint64(number)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint64::new(number)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint64::from(number u64/u32/u16/u8)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},'Uint64::try_from("34567")')),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Uint64::zero()")),(0,r.kt)("h3",{id:"checked-1"},"checked"),(0,r.kt)("p",null,"All the checked math functions work with Uint64 variables: checked_add, checked_sub, checked_mul, checked_div,\nchecked_div_euclid, checked_rem"),(0,r.kt)("h3",{id:"saturating-1"},"saturating"),(0,r.kt)("p",null,"All the saturating math functions work with Uint64 variables: saturating_add, saturating_sub, saturating_mul,\nsaturating_pow"),(0,r.kt)("h3",{id:"wrapping-1"},"wrapping"),(0,r.kt)("p",null,"All the wrapping math functions work with Uint64 variables: wrapping_add, wrapping_sub, wrapping_mul, wrapping_pow"),(0,r.kt)("h2",{id:"decimal"},"Decimal"),(0,r.kt)("p",null,"A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0 The greatest\npossible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)"),(0,r.kt)("p",null,"Including in file:\n",(0,r.kt)("inlineCode",{parentName:"p"},"use cosmwasm_std::Decimal;")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},'Decimal::from_str("1234.567")')),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Decimal::one()")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Decimal::zero()")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Decimal::percent(50)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Decimal::permille(125)")),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Decimal::from_ratio(1u128, 1u128)")))}s.isMDXComponent=!0}}]);