"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[6241],{3905:(t,e,n)=>{n.d(e,{Zo:()=>m,kt:()=>d});var a=n(7294);function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function r(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,a)}return n}function s(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?r(Object(n),!0).forEach((function(e){o(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function i(t,e){if(null==t)return{};var n,a,o=function(t,e){if(null==t)return{};var n,a,o={},r=Object.keys(t);for(a=0;a<r.length;a++)n=r[a],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(a=0;a<r.length;a++)n=r[a],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o}var l=a.createContext({}),c=function(t){var e=a.useContext(l),n=e;return t&&(n="function"==typeof t?t(e):s(s({},e),t)),n},m=function(t){var e=c(t.components);return a.createElement(l.Provider,{value:e},t.children)},p={inlineCode:"code",wrapper:function(t){var e=t.children;return a.createElement(a.Fragment,{},e)}},u=a.forwardRef((function(t,e){var n=t.components,o=t.mdxType,r=t.originalType,l=t.parentName,m=i(t,["components","mdxType","originalType","parentName"]),u=c(n),d=o,h=u["".concat(l,".").concat(d)]||u[d]||p[d]||r;return n?a.createElement(h,s(s({ref:e},m),{},{components:n})):a.createElement(h,s({ref:e},m))}));function d(t,e){var n=arguments,o=e&&e.mdxType;if("string"==typeof t||o){var r=n.length,s=new Array(r);s[0]=u;var i={};for(var l in e)hasOwnProperty.call(e,l)&&(i[l]=e[l]);i.originalType=t,i.mdxType="string"==typeof t?t:o,s[1]=i;for(var c=2;c<r;c++)s[c]=n[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},8533:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>l,contentTitle:()=>s,default:()=>p,frontMatter:()=>r,metadata:()=>i,toc:()=>c});var a=n(7462),o=(n(7294),n(3905));const r={id:"intro",slug:"/",sidebar_position:1},s="Introduction",i={unversionedId:"intro",id:"intro",title:"Introduction",description:"What is CosmWasm?",source:"@site/docs/01-intro.md",sourceDirName:".",slug:"/",permalink:"/docs/",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{id:"intro",slug:"/",sidebar_position:1},sidebar:"defaultSidebar",next:{title:"Your First Contract",permalink:"/docs/getting-started/intro"}},l={},c=[{value:"What is CosmWasm?",id:"what-is-cosmwasm",level:2},{value:"How to use CosmWasm",id:"how-to-use-cosmwasm",level:2},{value:"Sections",id:"sections",level:2},{value:"Additional Resources",id:"additional-resources",level:2}],m={toc:c};function p(t){let{components:e,...n}=t;return(0,o.kt)("wrapper",(0,a.Z)({},m,n,{components:e,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"introduction"},"Introduction"),(0,o.kt)("h2",{id:"what-is-cosmwasm"},"What is CosmWasm?"),(0,o.kt)("p",null,"CosmWasm is a smart contracting platform built for the Cosmos ecosystem. Simply put, it's the Cosmos (Cosm) way of using WebAssembly (Wasm) hence the name.  "),(0,o.kt)("p",null,"CosmWasm is written as a module that can plug into the Cosmos SDK. This means that anyone currently building a blockchain using the Cosmos SDK can quickly and easily add CosmWasm smart contracting support to their chain, without adjusting existing logic."),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://www.rust-lang.org/"},"Rust")," is currently the most used programming language for CosmWasm, in the future, it is possible to have different programming languages like ",(0,o.kt)("a",{parentName:"p",href:"https://www.assemblyscript.org/"},"AssemblyScript")),(0,o.kt)("p",null,"The purpose of this documentation is to give a deep dive into the technology for developers who wish to try it out or\nintegrate it into their products. Particularly, it is aimed at Go developers with experience with the Cosmos SDK, as well\nas Rust developers looking for a blockchain platform."),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},(0,o.kt)("a",{parentName:"p",href:"https://blog.cosmos.network/announcing-the-launch-of-cosmwasm-cc426ab88e12"},"Here")," you can read the launch article of CosmWasm.")),(0,o.kt)("h2",{id:"how-to-use-cosmwasm"},"How to use CosmWasm"),(0,o.kt)("p",null,"As CosmWasm is another Cosmos SDK module, a binary is enough to start integrating it into your blockchain."),(0,o.kt)("p",null,"A sample binary of CosmWasm integrated into the ",(0,o.kt)("inlineCode",{parentName:"p"},"gaiad")," binary, called\n",(0,o.kt)("inlineCode",{parentName:"p"},"wasmd")," is provided and can be found ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/CosmWasm/wasmd"},"here"),". Using wasmd it is possible to launch a new smart-contract enabled blockchain out of the box,\nusing documented and tested tooling and the same security model as the Cosmos Hub."),(0,o.kt)("p",null,"A running blockchain is needed to host and interact with the contracts. It can be either localhost, testnet, or a mainnet blockchain."),(0,o.kt)("p",null,"The details on how to ",(0,o.kt)("a",{parentName:"p",href:"/docs/getting-started/setting-env#setting-up-environment"},"connect to a testnet"),"\nor ",(0,o.kt)("a",{parentName:"p",href:"/docs/getting-started/setting-env#run-local-node-optional"},"set up a local devnet")," will be explained in the later sections."),(0,o.kt)("h2",{id:"sections"},"Sections"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"/docs/getting-started/intro"},"Getting Started")," dives you into hands-on training. It gently leads you through\nmodifying, deploying, and executing a smart contract on a local blockchain. It is the ideal place to go through and\nget acquainted with all the aspects of the system, without too much hard work coding.")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"/docs/architecture/multichain"},"Architecture")," explains much of the high-level design and architecture of\nCosmWasm. It is cruicial to understand the mental model and capabilities of the\nsystem before designing products using it. However, if you prefer to learn by coding then you can skip this section and visit as you need it.")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("strong",{parentName:"p"},"Learn")," demonstrates developing smart contracts from zero to production with step\nby step explanations, code snippets, scripts and more."),(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/dev-academy/intro"},"Dev Academy")," provides structured learning content starting from basics of blockchains and smart contracts to Cosmos SDK, CosmWasm smart contracts and clients."),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"/tutorials/hijack-escrow/intro"},"Tutorials")," demonstrates developing smart contracts from zero to production with step by step explanations, code snippets, scripts, and more."))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"/tutorials/videos-workshops"},"Workshops")," has a great collection of demonstrations and verbal explanations of CosmWasm\ntech stack recorded in various events and organizations.")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("p",{parentName:"li"},(0,o.kt)("a",{parentName:"p",href:"/cw-plus/0.9.0/overview"},"Plus")," is for state-of-the-art, production ready CosmWasm smart contracts."))),(0,o.kt)("h2",{id:"additional-resources"},"Additional Resources"),(0,o.kt)("p",null,"Lots of valuable information that will help you in your CosmWasm journey are also available outside of this documentation. "),(0,o.kt)("p",null,"Here, a few of them are listed:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://github.com/CosmWasm/cw-examples"},"A set of example smart contracts")," for experimenting."),(0,o.kt)("li",{parentName:"ul"},"Rustdoc for the ",(0,o.kt)("a",{parentName:"li",href:"https://docs.rs/cosmwasm-std/latest/cosmwasm_std/index.html"},"core contract libs"),"."),(0,o.kt)("li",{parentName:"ul"},"Rustdoc for the ",(0,o.kt)("a",{parentName:"li",href:"https://docs.rs/cosmwasm-storage/latest/cosmwasm_storage/index.html"},"storage helpers"),".")),(0,o.kt)("p",null,"There are quite a few ",(0,o.kt)("a",{parentName:"p",href:"https://medium.com/confio"},"high-level articles on medium")," that explain the various components of\nour stack and where we are going."),(0,o.kt)("p",null,"Many thanks to the ",(0,o.kt)("a",{parentName:"p",href:"https://interchain.io/"},"Interchain Foundation")," for funding most of the development work to bring\nCosmWasm to production."))}p.isMDXComponent=!0}}]);