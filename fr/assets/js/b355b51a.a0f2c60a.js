"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9554],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>m});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),c=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=c(e.components);return r.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=c(n),m=o,h=d["".concat(l,".").concat(m)]||d[m]||u[m]||a;return n?r.createElement(h,i(i({ref:t},p),{},{components:n})):r.createElement(h,i({ref:t},p))}));function m(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s.mdxType="string"==typeof e?e:o,i[1]=s;for(var c=2;c<a;c++)i[c]=n[c];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},1435:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>s,toc:()=>c});var r=n(7462),o=(n(7294),n(3905));const a={sidebar_position:4},i="Downloading and Compiling a Contract",s={unversionedId:"getting-started/compile-contract",id:"getting-started/compile-contract",title:"Downloading and Compiling a Contract",description:"In this section, we will download the code for a sample contract and compile it into a wasm binary executable.",source:"@site/docs/02-getting-started/04-compile-contract.md",sourceDirName:"02-getting-started",slug:"/getting-started/compile-contract",permalink:"/fr/docs/getting-started/compile-contract",draft:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"defaultSidebar",previous:{title:"Setting up Environment",permalink:"/fr/docs/getting-started/setting-env"},next:{title:"Deployment and Interaction",permalink:"/fr/docs/getting-started/interact-with-contract"}},l={},c=[{value:"Compiling and Testing the Contract Code",id:"compiling-and-testing-contract",level:2},{value:"Unit Tests",id:"unit-tests",level:2},{value:"Optimized Compilation",id:"optimized-compilation",level:2}],p={toc:c};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"downloading-and-compiling-a-contract"},"Downloading and Compiling a Contract"),(0,o.kt)("p",null,"In this section, we will download the code for a sample contract and compile it into a wasm binary executable."),(0,o.kt)("p",null,"If you haven't already, please review the ",(0,o.kt)("a",{parentName:"p",href:"/fr/docs/getting-started/setting-env"},"environment setup")," instructions first and either configure the Node.js REPL or the wasmd Go CLI before you proceed."),(0,o.kt)("h2",{id:"compiling-and-testing-contract"},"Compiling and Testing the Contract Code"),(0,o.kt)("p",null,"Let's download the repository in which we keep ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/InterWasm/cw-contracts"},(0,o.kt)("inlineCode",{parentName:"a"},"cw-contracts"))," and compile the existing code for a simple name service contract that mimics a name service marketplace."),(0,o.kt)("p",null,"First, clone the repo and try to build the wasm bundle:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"# Download the repository\ngit clone https://github.com/InterWasm/cw-contracts\ncd cw-contracts\ngit checkout main\ncd contracts/nameservice\n\n# compile the wasm contract with stable toolchain\nrustup default stable\ncargo wasm\n")),(0,o.kt)("p",null,"The compilation should output the file ",(0,o.kt)("inlineCode",{parentName:"p"},"target/wasm32-unknown-unknown/release/cw_nameservice.wasm"),". With a quick ",(0,o.kt)("inlineCode",{parentName:"p"},"ls -lh")," you can see that the file size is around 1.8 MB. This is a release build, but not stripped of all the unneeded code. To produce a much smaller version, you can run the following command which tells the compiler to strip the unused parts of the code out:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"RUSTFLAGS='-C link-arg=-s' cargo wasm\n")),(0,o.kt)("p",null,"This produces a file that is about 165kB in size. We either use the command above or utilize another Rust optimizer, the use of which will be covered in the ",(0,o.kt)("a",{parentName:"p",href:"#optimized-compilation"},"optimized compilation section"),", to produce the smallest final wasm binary before it is uploaded to the blockchain."),(0,o.kt)("h2",{id:"unit-tests"},"Unit Tests"),(0,o.kt)("p",null,"Let's try running the unit tests:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},"RUST_BACKTRACE=1 cargo unit-test\n")),(0,o.kt)("p",null,"After some compilation steps, you should see:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-text"},"running 15 tests\ntest tests::tests::proper_init_no_fees ... ok\ntest tests::tests::fails_on_register_insufficient_fees ... ok\ntest coin_helpers::test::assert_sent_sufficient_coin_works ... ok\ntest tests::tests::fails_on_register_wrong_fee_denom ... ok\ntest tests::tests::fails_on_register_already_taken_name ... ok\ntest tests::tests::fails_on_transfer_from_nonowner ... ok\ntest tests::tests::fails_on_transfer_insufficient_fees ... ok\ntest tests::tests::fails_on_transfer_non_existent ... ok\ntest tests::tests::proper_init_with_fees ... ok\ntest tests::tests::register_available_name_and_query_works ... ok\ntest tests::tests::register_available_name_fails_with_invalid_name ... ok\ntest tests::tests::returns_empty_on_query_unregistered_name ... ok\ntest tests::tests::register_available_name_and_query_works_with_fees ... ok\ntest tests::tests::transfer_works ... ok\ntest tests::tests::transfer_works_with_fees ... ok\n\ntest result: ok. 15 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out;\n")),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"RUST_BACKTRACE=1")," will provide you with full stack traces on any error, which is super useful. This only works for unit tests (which test native rust code, not the compiled wasm). Also, if you want to know where ",(0,o.kt)("inlineCode",{parentName:"p"},"cargo wasm"),"\nand ",(0,o.kt)("inlineCode",{parentName:"p"},"cargo unit-test")," come from, they are just aliases defined in the file ",(0,o.kt)("inlineCode",{parentName:"p"},".cargo/config")," located in the project directory. Take a look at the file contents to understand the cargo flags better."),(0,o.kt)("h2",{id:"optimized-compilation"},"Optimized Compilation"),(0,o.kt)("p",null,"To reduce gas costs, the binary size should be as small as possible. This will result in a less costly deployment, and lower fees on every interaction. Luckily, there is tooling to help with this. You can ",(0,o.kt)("strong",{parentName:"p"},"optimize production code")," using the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/CosmWasm/rust-optimizer"},"rust-optimizer"),". ",(0,o.kt)("inlineCode",{parentName:"p"},"rust-optimizer")," produces reproducible builds of CosmWasm smart contracts. This means third parties can verify that the contract is actually the claimed code."),(0,o.kt)("admonition",{type:"info"},(0,o.kt)("p",{parentName:"admonition"},"You will need ",(0,o.kt)("a",{parentName:"p",href:"https://www.docker.com"},"Docker")," installed in order to run ",(0,o.kt)("inlineCode",{parentName:"p"},"rust-optimizer"),".")),(0,o.kt)("p",null,"Navigate to the project root and run the following command:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},'docker run --rm -v "$(pwd)":/code \\\n  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \\\n  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \\\n  cosmwasm/rust-optimizer:0.12.6\n')),(0,o.kt)("p",null,"On Windows, you can use the following command instead"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-powershell"},'docker run --rm -v ${pwd}:/code `\n --mount type=volume,source="$("$(Split-Path -Path $pwd -Leaf)")_cache",target=/code/target `\n --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry `\n cosmwasm/rust-optimizer:0.12.6\n')),(0,o.kt)("p",null,"The binary will be under the folder ",(0,o.kt)("inlineCode",{parentName:"p"},"artifacts")," and its size will be ",(0,o.kt)("inlineCode",{parentName:"p"},"138 kB"),"."))}u.isMDXComponent=!0}}]);