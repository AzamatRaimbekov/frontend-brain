# Mbank tokens (full values, Full-seat read 2026-10-09)

Source of truth for values and keys. Machine copy: `tokens.json`. Import any variable with `figma.variables.importVariableByKeyAsync(key)`, any style with `figma.importStyleByKeyAsync(key)`.

## 1. Spacing

Mobile KIT uses `paddings/default/*` (collection `foundation`, scope GAP). Web/CRM use `spacing/*` (Web components, aliases of `rem/default/*`).

| px | Mobile `paddings/default/*` | key | Web `spacing/*` | key |
|---|---|---|---|---|
| 0 | `paddings/default/none` | `fb109a5072b402ff23bef536000e8e6b2c5ef8d5` | `spacing/none` | `469eae815f2cdfa1596c9cdb6701618e0030a899` |
| 2 | `paddings/default/xs` | `4e84b77b36220c2f282456e7cf0495104d5084dd` | `-` | `-` |
| 4 | `paddings/default/xs 2` | `d4c8e9d721b5696cee908a4366ad497721653773` | `spacing/xs` | `49fe1d2a4517444f7f637ea69fad54c17decba64` |
| 8 | `paddings/default/s` | `6e80bc94476fe9fb8e18a2ecd1184d9cc31865df` | `spacing/s-3` | `25548a2aee9592223ee300340cc03b54847db6b8` |
| 10 | `-` | `-` | `spacing/s-2` | `bd33cdc1be90ca2ac5f3d0beb7e6cd3dcbe826e9` |
| 12 | `paddings/default/s - 2` | `c44220317b3fa1713b480e666de7cd5fc2540446` | `spacing/s-1` | `b7f3190a4d32d94e37e2349ac0035f2b7a28ddf7` |
| 14 | `paddings/default/m` | `f5a1fba27841d60b694005eb8da23f146b5c3269` | `-` | `-` |
| 16 | `paddings/default/m - 2` | `81a966b963f940ab223bdc6d0742e7222a85a39f` | `spacing/m-2-base` | `06f234ad59d196f83831e10bcb2ba0dda48564a8` |
| 20 | `paddings/default/l` | `22db93c32da263a7da496ff79f405638628a6c17` | `spacing/m-1` | `945c102a9deead688072a884e69d5b10932b013e` |
| 24 | `paddings/default/xl` | `3415f336c1457466e9e4026def9f3f53ad1477c2` | `spacing/l-2` | `c25e02637c18d4b74c20014d98a2ee237c50749a` |
| 28 | `paddings/default/xxl` | `77387b36180f1321d8fb6a702a1294c1c7a9d0f2` | `spacing/l-1` | `139bc110af5978890090115e3686b93fa86dbef0` |
| 32 | `paddings/default/xxxl` | `e26c9bc27be00b5e5452fd6ff1e9100bb129f547` | `spacing/xl-2` | `d80486a8ad621a92eefd5fa6500a3ce339f6dd76` |
| 36 | `-` | `-` | `spacing/xl-1` | `afc59ca2bae3e2c7b18935a7f518fe9a12aa6fcd` |
| 40 | `-` | `-` | `spacing/xxl-2` | `5112dc6b296ab4e9d858030023ca5db8790524d2` |
| 48 | `-` | `-` | `spacing/xxl-1` | `f68a450bfa5d2d835a3493982430608b136b0692` |

Negative (overlaps): `paddings/inverse/-xs` -4, `-s` -8, `-m` -16 (mobile). Names do not follow px order (`xs` = 2, `xs 2` = 4, `m` = 14): always pick by value from this table.

## 2. Radius

| px | Mobile `radius/*` (foundation) | key | Brand `radius/*` (1.brand, web) | key |
|---|---|---|---|---|
| 0 | `radius/none` | `307348f93f8587eb6f3eca52b4778f9a092d35bb` | `radius/none` | `8d2416e70df7331ba3e0496575be0c02514377fb` |
| 2 | `-` | `-` | `radius/xss` | `243485996c0d982afbccdfdfc18c58ead796485b` |
| 4 | `radius/xxs` | `eea831d02251e6334c9383c2a8dbaf8ac1c467b5` | `radius/xs` | `e5e218dc0552b718be2cdcf3992ae8475ee3f492` |
| 8 | `radius/xs` | `d3785f1a672886dab4f07230c66d7cb14677b87d` | `radius/s` | `9d4b1d6c55e145f473e312025829306854a3a023` |
| 12 | `radius/s` | `5ad164a0bfd5cf02aad0e9578356a2ae6e3f4005` | `radius/m` | `cff2d86748887ff2a64d9de8911be6e9c7c48f3e` |
| 16 | `radius/m` | `e0a9d7d5ad30e3eb9ed959084e24d924674ef691` | `radius/l` | `215a81ed22f0545e5c4e4bacdaba3f52506fc65e` |
| 20 | `radius/l` | `9bf7a0dce8faa91850c3902d2b1b6a1aa67a2546` | `radius/xl` | `46ff3d87efcea0e8e529e8dbaa14ee9c81faafb2` |
| 24 | `radius/xl` | `6b44870a2403aaf41999d1892a919dae2cf1c0f7` | `radius/xl-2` | `5c0fd5fb1f56125215d6330cdee12086f32a53f7` |
| 32 | `-` | `-` | `radius/xl-3` | `b60fc0f5852bc96ca2f6c0cf1711f36f033d788d` |
| 40 | `-` | `-` | `radius/xl-4` | `0552e3addd4a74430e7c53b6718479b9aa6d60e6` |
| 1000 | `radius/xxl` | `71e2e936964d07b19be084f25da408f1d7ba670b` | `radius/full` | `880334001c5c1a616d6700df798cd84e29cf0070` |

Same name, different value: mobile `radius/m` = 16, web `radius/m` = 12. Use the kit's own collection (Mobile KIT components already bind mobile radius).

## 3. Colours: 2.theme (light | dark)

Bind semantic `2.theme` variables only; `1.brand` for brand accents; never primitives. Dark values exist for all 256 variables.

| Variable | Light | Dark | key |
|---|---|---|---|
| `brand/bank/default` | #16a34a | #189547 | `12e4e4596b58af08ecfc0c67c3075266c235e6d8` |
| `brand/bank/hover` | #189547 | #22c55e | `171014cab90121189edc02101a38fc444d0b2084` |
| `brand/bank/active` | #16a34a | #22c55e | `dee979923a63b7e630b81bd9928f1d0400c98800` |
| `brand/bank/on-accent` | #ffffff | #ffffff | `03bc6482935f3fc98465a9b9e879fd12b523a9f6` |
| `brand/bank/on-accent-muted` | #a9b4bc | #a9b4bc | `7c91fabda64717d68fe0686136acd5cc45959f59` |
| `brand/bank/container-muted` | #f0f3f4 | #3f4146 | `3791df61bfbcee5205255396ceb79c3f821dfff3` |
| `brand/bank/ghost-default` | #f0fdf4 | #16a34a1a | `4f19513acba69cbd31ef0b5e741c6b9345281b0a` |
| `brand/bank/ghost-hover` | #e8fcee | #16a34a1a | `8d57d4b3cb74579ea3e7d9c671348727e0f0abb6` |
| `brand/bank/ghost-active` | #f0fdf4 | #16a34a1a | `a741becb0d755013843167392086c2ca753a493d` |
| `brand/bank/ghost-on-accent` | #16a34a | #189547 | `94f6942d3a1762a86c5bddbeb6437636689ad77c` |
| `brand/bank/ghost-on-accent-muted` | #86efac | #16a34a1a | `03c5d1cf769c90977351b9c41523e781d68a97b0` |
| `brand/bank/ghost-container-muted` | #f0fdf4 | #16a34a1a | `9928396b12c637c90694aed070e0fd4c0ccd8084` |
| `brand/kassa/default` | #2563eb | #3b82f6 | `5dd34baabc8a192769410ef7b2102a257b71892e` |
| `brand/kassa/hover` | #1d4ed8 | #1d4ed8 | `9f6d43bd181b1af0efecb8ddd0d252fcad933889` |
| `brand/kassa/active` | #1d4ed8 | #2563eb | `9495ccf8001c3651f0e8d416a7e58971c12eb0c7` |
| `brand/kassa/on-accent` | #ffffff | #ffffff | `5458fb3049697c6195554f1219b6e44851b24781` |
| `brand/kassa/on-accent-muted` | #a9b4bc | #a9b4bc | `2323b160e675d6180d2e3275dec131497579a96c` |
| `brand/kassa/container-muted` | #f0f3f4 | #3f4146 | `778497db53d43e3cee8b37992455d0b03c81857e` |
| `brand/kassa/ghost-default` | #dbeafe | #13203d | `6833a82d76193190f62f27af4700d5d8482550aa` |
| `brand/kassa/ghost-hover` | #bfdbfe | #162c5d | `4db3961a3fc1eab8c783e7bc33ad67974962c868` |
| `brand/kassa/ghost-active` | #dbeafe | #173168 | `e1c384fb0fde2eeb0ca32843664a91a4bd64df89` |
| `brand/kassa/ghost-on-accent` | #1d4ed8 | #2563eb | `948c2e82b98ffb2b4d8bdcdf5f0d2dfed35e095d` |
| `brand/kassa/ghost-on-accent-muted` | #3b82f6 | #60a5fa | `3644fb31a91b287acfeab9a77abca1918287b784` |
| `brand/kassa/ghost-container-muted` | #eff6ff | #101727 | `14ff6aab7166f335ad0e33ce5767a5af15ff6304` |
| `brand/travel/default` | #60a5fa | #3b82f6 | `5e8ca0af3975d72bf9f2861a0aba97ff90dfe723` |
| `brand/artwin/default` | #fddb2b | #f7c21c | `206601d34fec5059fc773cf49ce0338ac328c1ec` |
| `brand/artwin/hover` | #f7c21c | #fddb2b | `c8025d51a4c30dae7e774345686ca04ee19e1e86` |
| `brand/artwin/active` | #fddb2b | #fddb2b | `561fa0768650b686d1b4672a07510da9bc8988a6` |
| `brand/artwin/on-accent` | #0e0f11 | #a9b4bc | `d4042687755e2092881eab03e6c41e15208017dd` |
| `brand/artwin/on-accent-muted` | #a9b4bc | #3f4146 | `b1afb8a55de6093d959d3684b1d3728ea6272208` |
| `brand/artwin/container-muted` | #f0f3f4 | #f0f3f4 | `32266133ec30b3f616728b6271c8ca9deeb2a787` |
| `brand/artwin/ghost-default` | #fef7b4 | #2563eb33 | `bddcc2f203a19cdb1225e78b72cd033e720cced2` |
| `brand/artwin/ghost-hover` | #fef08a | #2563eb33 | `f1b946191ef9d1f12a348ad700f6b489d5351b07` |
| `brand/artwin/ghost-active` | #fef7b4 | #2563eb33 | `727a5ea0cd028ba0cf9ceaf372b01922abe5f9fc` |
| `brand/artwin/ghost-on-accent` | #d9a607 | #2563eb33 | `97154a2943f9136c160c0d7ec7cddab4c3a7f80d` |
| `brand/artwin/ghost-on-accent-muted` | #f7c21c | #2563eb33 | `eeae26c52d475650a250ab53ef592e6071ce05ca` |
| `brand/artwin/ghost-container-muted` | #fefce8 | #2563eb33 | `90447f587bce8232b882b3a2031e2b8282262a30` |
| `brand/travel/hover` | #4d9af9 | #3b82f6 | `b0d9734725216fd64b5b1c156ade8bae29856d5c` |
| `brand/travel/active` | #60a5fa | #60a5fa | `9622bdc1ea284c054c23c0cfb154ceb268983fed` |
| `brand/travel/on-accent` | #ffffff | #ffffff | `207149bf7d9b0f34ae31970e3583d10e85ea22e6` |
| `brand/travel/on-accent-muted` | #a9b4bc | #a9b4bc | `4acd783d4e7bb82843a00d7e56fd6ba5f0d7e25a` |
| `brand/travel/container-muted` | #f0f3f4 | #3f4146 | `411a2f33bb28b640e313538e383c1ce6e59a73cc` |
| `brand/travel/ghost-default` | #eff6ff | #2563eb33 | `52ac5354f5e1665977d6fe52790c5d05e664dbe9` |
| `brand/travel/ghost-hover` | #e5f1ff | #2563eb33 | `b18a86f98a0f8b2578c0f4b63681ba8378ef3e33` |
| `brand/travel/ghost-active` | #eff6ff | #2563eb33 | `bacc51429a04e6af5666b05bf65168abc2b3977b` |
| `brand/travel/ghost-on-accent-muted` | #93c5fd | #2563eb33 | `545b7b1f5ed08e1bd2f8515913ac2c431d548126` |
| `brand/travel/ghost-container-muted` | #eff6ff | #2563eb33 | `3f6e7c1341b4523a99e1eed9b752130c9d2e719c` |
| `brand/travel/ghost-on-accent` | #60a5fa | #2563eb33 | `7c076c66db830c6de58eff2ef221cc41592e2e88` |
| `accent/primary/default` | #fddb2b | #f7c21c | `2547333051bd1cffc8f9f2aba391bee960d750c9` |
| `neutral/primary/default` | #17191d | #26292e | `082d1082b3a083bb57b8f0a9e7f2646e1285beed` |
| `neutral/primary/hover` | #26292e | #464e58 | `2cb95313acd7575d217d9885f6a3ba0292e9fdd8` |
| `neutral/primary/active` | #17191d | #464e58 | `847bd8512d6dc19207b6b80674e053dd867f3df1` |
| `neutral/primary/on-accent` | #0e0f11f2 | #0e0f11 | `850d035c748c1bafefc3fb2f9ce21a77f1e16afb` |
| `neutral/primary/container-muted` | #f0f3f4 | #3a3c41 | `c1195d122ebce15eca2981b918e9fcbbaeca9f22` |
| `neutral/primary/on-accent-muted` | #93a0a9 | #0e0f11f2 | `1a6dcc903b732c0860254eb87f608d81914200e9` |
| `neutral/secondary/flat default/default` | #e0e5e8 | #26292e | `e964071fb5ae6d4ff91c17ec0bdc777265006f83` |
| `neutral/secondary/flat default/hover` | #d7dce1 | #1d2024 | `17c06fabfe9e30851abdf22a9adecd9286d7eefc` |
| `neutral/secondary/flat default/active` | #d7dce1 | #1d2024 | `f3ad249ef22b723653e4a2d79e13784ec18f9fec` |
| `neutral/secondary/flat default/on-accent` | #0e0f11 | #f0f3f4 | `7e997f25e8e9794d5ff681a827576b6dbc3bb36b` |
| `neutral/secondary/flat default/container-muted` | #f6f8f9 | #3a3c41 | `b4c2ed6c82f71751ffb7495563974025e0bc4cb8` |
| `neutral/secondary/flat default/on-accent-muted` | #5d6c79 | #a9b4bc | `d74e7c9755451432691a266818d2ab5e0210da66` |
| `neutral/secondary/flat/default` | #ffffff00 | #26292e | `3003ad655612547f33197428ae0b4f9442a02caa` |
| `neutral/secondary/flat/hover` | #d7dce1 | #20232700 | `2a4fa1126c90e06b620dabe023ab5b2844c58d80` |
| `neutral/secondary/flat/active` | #d7dce1 | #20232700 | `1d5e1a28632b63519545234b2129f87a21ca9fb7` |
| `neutral/secondary/flat/on-accent` | #0e0f11 | #f0f3f4 | `9a09df272e93597bd204c33cbad9cb9c27ce75c8` |
| `neutral/secondary/flat/container-muted` | #ffffff00 | #3a3c4100 | `08e4db70fed2d45423b386e1cc89f04d06c27f6e` |
| `neutral/secondary/flat/on-accent-muted` | #0e0f11 | #a9b4bc | `7aecf76a9e77147f2b13df5b053d9d3d29e41e4a` |
| `neutral/secondary/flat filled/default` | #e0e5e8 | #26292e | `8807556f95b98cd30cac23158e361dbbabe046ee` |
| `neutral/secondary/flat filled/hover` | #d7dce1 | #202327 | `8ab173cead104575db05fe41799b8ed78dba3db3` |
| `neutral/secondary/flat filled/active` | #d7dce1 | #202327 | `c953dea4173c81ed5e3874f190031366b9920be2` |
| `neutral/secondary/flat filled/on-accent` | #0e0f11 | #f0f3f4 | `e42d34d9f287b5a0a54ec77db20ba1b24e39ec42` |
| `neutral/secondary/flat filled/container-muted` | #0e0f11f2 | #3a3c41 | `bc6573643235e1a1923710a58642dd716bccb913` |
| `neutral/secondary/flat filled/on-accent-muted` | #0e0f11 | #a9b4bc | `dc77f3ec3c4713a12829aae2358650ea69940b3d` |
| `neutral/secondary/outline/default` | #e0e5e8 | #26292e | `2461f38b7d19f180954432c22346812630cf0a0d` |
| `neutral/secondary/outline/hover` | #cad1d7 | #202327 | `02e23e7b06ace1f4d2a0bc450cb5de50589f9ce0` |
| `neutral/secondary/outline/active` | #cad1d7 | #202327 | `9b0d66900ca306f6b9dff2c1aaf67fe11bb4f875` |
| `neutral/secondary/outline/on-accent` | #0e0f11 | #202327 | `02385f1e3d8489893bc403b83af0b3dc8b8859be` |
| `neutral/secondary/outline/on-accent-muted` | #0e0f11 | #0e0f11f2 | `0a5b50116e25662756a61e96bca73f911e26e273` |
| `neutral/secondary/outline/container-muted` | #f6f8f9 | #26292e | `4501ea3188e6502c04266d82c9ad49d5bdfbfbd2` |
| `neutral/negative/default` | #feebeb | #b91c1c | `7c507104d0f9c48829ed82d10239cee95eedc293` |
| `neutral/negative/hover` | #fee2e2 | #b91c1c | `da22c2b67af546c841c5c3560105c00886474bb6` |
| `neutral/negative/active` | #fee2e2 | #b91c1c | `dd47676b678574b8509943a8c7743225c332a9e5` |
| `neutral/negative/on-accent` | #ef4444 | #0e0f11f2 | `804f284adcaa6af59e8169642d3e5703cecf3dd3` |
| `neutral/negative/container-muted` | #feebeb | #fca5a5 | `6059caa72c3269f8bcb3a367900e49007375cabf` |
| `neutral/negative/on-accent-muted` | #fca5a5 | #0e0f11f2 | `cf3c3a71b0bdd39e8020811f316748c1f0c4c3b0` |
| `neutral/positive/default` | #ecfdf5 | #ecfdf5 | `5df7f0ddd95348768ad8c4fe9d11d05951fe5f43` |
| `neutral/positive/hover` | #dffced | #dffced | `cf1a095e7675eaa3cff748a29ccd29c994258cd7` |
| `neutral/positive/active` | #dffced | #dffced | `79bd7dfd020803a06a136ba2fd29e6d33c74c556` |
| `neutral/positive/on-accent` | #0fa976 | #0fa976 | `5d9167092a312b8188d60a68d6098059f9c1a525` |
| `neutral/positive/container-muted` | #ecfdf5 | #ecfdf5 | `c715c4e2fd2d7eaa0850a66760e7f676a948c8b3` |
| `neutral/positive/on-accent-muted` | #0fa976 | #0fa976 | `595458ab8622a2b9f53bbefb1d9f31f70d90b678` |
| `neutral/static/default` | #0e0f11 | #0e0f11 | `448af814ad20db49ead9be6b7ef02e55e116bdaf` |
| `neutral/static/hover` | #26292e | #26292e | `106cfb25e7fd8074b7e6d7900eda84a47d1aa172` |
| `neutral/static/active` | #0e0f11 | #0e0f11 | `7fe368c6595cdfb2ab5e1096ae2ab83fc23d303c` |
| `neutral/static/on-accent` | #ffffff | #0e0f11f2 | `854005feab469595b9586d967f704ff4a955f8fc` |
| `neutral/static/on-accent-muted` | #93a0a9 | #93a0a9 | `e229789d4ca46d2865816a119a463b2744abbfd1` |
| `neutral/static/container-muted` | #f0f3f4 | #f0f3f4 | `97d53b3d31d05155981ddb40fc88581dba8812a4` |
| `accent/primary/hover` | #f7c21c | #fddb2b | `6b557bc7821bb9fc5b0d2b2fe933bbc9d9ed23c8` |
| `accent/primary/active` | #fddb2b | #fddb2b | `7dad401d284a0665062ccdb2af0f89b898fa911a` |
| `accent/primary/on-accent` | #0e0f11 | #0e0f11 | `5e755c94dc67c5dea2ec450f7eb50c4223859c47` |
| `accent/primary/on-accent-muted` | #0e0f11 | #0e0f11 | `cdd021e79fa64da6e795f524c455208a5dad21f8` |
| `accent/primary/container-muted` | #fef08a | #fef08a | `f51910b07f47fce154594921a4fc339d6347ab13` |
| `accent/secondary/flat/default` | #f0f3f4 | #26292e | `da80bc6968b1ae081d2e8152229a27cccc2e200b` |
| `accent/secondary/flat/hover` | #e0e5e8 | #3f4146 | `d4a319e901a82d17f0007f8554df5be561ab2363` |
| `accent/secondary/flat/active` | #f0f3f4 | #26292e | `4cc8a214d7a202004df5788a18d6ac8fec612867` |
| `accent/secondary/flat/on-accent` | #3b82f6 | #3b82f6 | `860e76a24bbea21039e31ddb33af9d61fd62c233` |
| `accent/secondary/flat/container-muted` | #f4f6f7 | #3a3c41 | `0c1d4a79f618cd9a4e5af8cf1610a0ae655c2b63` |
| `accent/secondary/flat/on-accent-muted` | #3b82f6 | #0e0f11f2 | `0fd195a7c5c4fa70d7c5c0350fd57124c5cf8f9b` |
| `accent/negative/default` | #ef4444 | #b91c1c | `3717327211c6b7f0a3f533f2f0c79f865b529f30` |
| `accent/positive/default` | #0fa976 | #0fa976 | `454762e6ceaea6431078b001351ace25d4e7e9dd` |
| `accent/static/default` | #ffffff | #ffffff | `cc0476ada5bec7d0deac8b51f9ecf77183407a22` |
| `accent/static/hover` | #d7dce1 | #d7dce1 | `94226beb537849177b9556669e1ad5153bc192c2` |
| `accent/static/active` | #ffffff | #cad1d7 | `292a0dc7347bb1be5b4943ae40cc9e9a0d909ac4` |
| `accent/static/on-accent` | #0e0f11 | #0e0f11 | `c94073320949e77be47c3ce53eb51d104b5da43c` |
| `accent/static/container-muted` | #ffffff | #768793 | `89602c2aae0faed3abce2252378c5b5293f6f26c` |
| `accent/static/on-accent-muted` | #0e0f11 | #0e0f11 | `b27997c1cf48595b74bef839b7383e2788a8683f` |
| `accent/positive/hover` | #059669 | #059669 | `6b9599885cefa8bc7cdf2a19f7a9f5629fda1ce4` |
| `accent/positive/active` | #0fa976 | #10b981 | `9b091443a860ecd5a32379af21a579ffe59c5855` |
| `accent/positive/on-accent` | #0e0f11f2 | #0e0f11f2 | `01b82dea3e963da6e01f4ca08923b0c14511705d` |
| `accent/positive/container-muted` | #d1fae5 | #d1fae5 | `aac4cd3543030c4fd888c73dffa0726b9d1de149` |
| `accent/positive/on-accent-muted` | #0e0f11f2 | #0e0f11f2 | `e109107ddbe665ea5bab26eefcb04d9e203ab60f` |
| `accent/negative/hover` | #b91c1c | #b91c1c | `746a41958228054bd386b27501bf85a033dc4891` |
| `accent/negative/active` | #ef4444 | #b91c1c | `a666254f7ddcc865dc06649724a798da5aaab422` |
| `accent/negative/on-accent` | #0e0f11f2 | #0e0f11f2 | `bc02a16da8fc10b5c20d8700fd21cc782d4af51d` |
| `accent/negative/container-muted` | #fca5a5 | #fca5a5 | `b7c353146262738e83d00afb5765d666379a223c` |
| `accent/negative/on-accent-muted` | #0e0f11f2 | #0e0f11f2 | `2dc7fc4bfa5698d5e6730e36c4c85aef057ca2db` |
| `static/light` | #ffffff | #ffffff | `5c4810c36d8078c5314d391514845b5c5828b8df` |
| `static/dark` | #0e0f11 | #0e0f11 | `fbd4bfe877400ffe7e3af5a2572847c03e587e80` |
| `text/brand` | #16a34a | #189547 | `9182775236adb96970d21e01ce9fbee25834e230` |
| `text/default` | #0e0f11 | #f0f3f4 | `8af86f380514faeacdc79b7a232d03723fab0bde` |
| `components/chipsButton/soft/default` | #e0e5e8 | #3f4146 | `e4ac0f7453347b568d1792b1bd6b2a236ab9c2c1` |
| `text/soft` | #40474f | #d7dce1 | `f729c62f2c73030dcb2f5a7b78984146b05aea2b` |
| `text/muted` | #768793 | #768793 | `8bb44dbea94883e123e8c8999072b7e40886ca68` |
| `components/chipsButton/soft/hover` | #d7dce1 | #26292e | `3f881b557413b377c101cd1cf6733d3c6c81fe31` |
| `text/disabled` | #a9b4bc | #5d6c79 | `667c29a1ebfcefbc7be637b6c421c1f6fba79b51` |
| `components/chipsButton/soft/active` | #17191d | #4d5661 | `d315b1aa94b6c541d0ceb9ab0618564ee7031979` |
| `text/inverse` | #f4f6f7 | #0e0f11 | `f85ccfae4cfb11d0d3436726babf269a22afdd7e` |
| `text/link` | #3b82f6 | #3b82f6 | `3019aa5c09a3caaa6ef5a60a0aea282d659084ea` |
| `text/danger` | #ef4444 | #b91c1c | `c71864d1c0dbe42e85d945e45b2e8b2e07f2873b` |
| `text/positive` | #0fa976 | #059669 | `38f2afee24740dccbb19d9f5bd8488b50973c359` |
| `text/warning` | #f97316 | #ea580c | `863eb2737166b081d843174d16b1842c62eea90c` |
| `components/chipsButton/light/default` | #ffffff | #515c69 | `c77c6d36c42a1dac30ef4b05a5aade2b509ac1a9` |
| `components/chipsButton/light/hover` | #f4f6f7 | #515c69 | `e8da076d4edb2dc308bd0725bd4434771e8fde82` |
| `components/chipsButton/light/active` | #17191d | #515c69 | `a79bf5e6055a74e21563bba187c89d0f4dc5aadf` |
| `background/surface/light` | #ffffff | #0e0f11 | `6b620b0494f77db47571a4133623011b8f0fe3b5` |
| `background/surface/soft` | #f4f6f7 | #17191d | `9937a9232afab99fdc4fa020576aae016c3d7630` |
| `background/onsurface/0` | #ffffff | #26292e | `597e34eb4635ee8b4625923be7f8b6496f987f1c` |
| `background/global/clear/default` | #ffffff00 | #1b1e22 | `9a8e2ee53b78cef5d7a3ecdd6ceb22ebadf564dd` |
| `background/global/light/default` | #ffffff | #1b1e22 | `eea1abcc3330f203d90fec3a838007499cff7997` |
| `background/global/light/hover` | #eaeef0 | #40474f | `37529e5928f9e857069853b4a5775209092779e5` |
| `background/global/light/active` | #f0f3f4 | #373c42 | `852d6da2b613c8529cbbc013c3aff18cf60889ff` |
| `background/global/light/container-muted` | #ffffff00 | #40474f | `50482fc1d0f6450a247148aed6b8b7eed39dd0b0` |
| `background/global/soft/default` | #e0e5e8 | #373c42 | `53a04a552dad4c0b33bbbb141d85db8e91f0e62a` |
| `background/global/soft/hover` | #eaeef0 | #40474f | `da113c8a57297ff4ccc92c908b9e2e2c0407cad4` |
| `background/global/soft/active` | #eaeef0 | #373c42 | `a8a0895f496f7ceab6151e4663df72324cfadabc` |
| `background/global/soft/container-muted` | #ffffff00 | #40474f | `0ba898b66fd18a189ef0fc5dbf2055ffe1940606` |
| `background/global/clear/hover` | #eaeef0 | #40474f | `5c3c1667e9ee8759de59d89a675249d8c2f82094` |
| `background/global/clear/active` | #ffffff00 | #ffffff00 | `4e2c605fe109a44bb90452bfc4acf361e9351f92` |
| `background/global/clear/container-muted` | #ffffff00 | #40474f | `f064a4c6cb6aaab8d3a00e7aa30c4d49c0863229` |
| `background/onsurface/1` | #f4f6f7 | #2e3238 | `6ff51ba6d871c88f2ab26ab3d74b76f72bfe63f1` |
| `background/onsurface/2` | #eaeef0 | #3a3c41 | `fbe8e32317aa0b95304841f2881d7d01c810fa33` |
| `background/onsurface/3` | #d7dce1 | #3f4146 | `79215f526cdbdc48db8837e6d61048e072896d9f` |
| `background/onsurface/4` | #cad1d7 | #40474f | `57ddc4d21ad7814cd9e5a04f2fb5505359e28ec9` |
| `background/onsurface/5` | #a9b4bc | #464e58 | `fce09485d8065467a5abed1c4f9854c683f69988` |
| `background/onsurface/6` | #768793 | #4d5661 | `6fa2c477f4797f975d8b37e89c55f35836b382f1` |
| `background/onsurface/0-inverse` | #0e0f11 | #f4f6f7 | `b07141d92666bb6469056965114ce8385823763b` |
| `border/accent/danger` | #ef4444 | #dc2626 | `a725b5229c21f98c37ffdbbd676b50ffd49c24be` |
| `border/accent/positive` | #0fa976 | #0fa976 | `41b2aaa3f8ca573a86354875fbbc2a681ff96979` |
| `border/accent/warning` | #f97316 | #f97316 | `6176d3a6b84d308ca2af1e0f3fa5db0c1e456e4e` |
| `border/accent/brand` | #16a34a | #189547 | `dc946628c987112c7727236e341ca1bc72acd278` |
| `border/divider/primary` | #e0e5e8 | #3a3c41 | `51813af7717630a119a3ea6291e05b540359c8c5` |
| `border/global/soft/default` | #d7dce1 | #4d5661 | `2633ff7c179a75b585932d697e2c9c0967f7005e` |
| `border/global/soft/hover` | #768793 | #515c69 | `0011f441b8c33d89cd6610c2325f3cf599248f34` |
| `border/global/soft/filled` | #d7dce1 | #40474f | `6e85c3539201fec02d1a3e79197d074a655a95ba` |
| `border/global/soft/active` | #a9b4bc | #515c69 | `ae82d51efbabd022f3d5fb769cafb5693538676f` |
| `border/global/soft/disabled` | #eaeef0 | #26292e | `60b115ea0f2bea5f926325412bef066624af1020` |
| `border/divider/secondary` | #d7dce1 | #40474f | `9da710ec28de3b2bcbdecc9da0d8e6a84ebd2710` |
| `border/divider/tetriary` | #cad1d7 | #464e58 | `a8277d111f27e8a58ff96ab381ad246898660068` |
| `status/filled/bg/default` | #5d6c79 | #a9b4bc | `8e125a92ece57b864b1c321a805d389c15508618` |
| `status/filled/bg/accent` | #fddb2b | #fddb2b | `9cebb5a355608795a767ac9853404fbb43db5206` |
| `status/filled/bg/success` | #10b981 | #10b981 | `fc1939007674cf3c93b1c94017470f8c6a87573a` |
| `status/filled/bg/warning` | #ea580c | #ea580c | `d2001fcbd94fb99277f5761d0d4f66072c415c5d` |
| `status/filled/bg/error` | #e11d48 | #e11d48 | `27dee2b70f6e109a4b3a2ac5966cb8bfc42024eb` |
| `status/filled/bg/info` | #2563eb | #2563eb | `3ad196a6d3a682b186c23de842f6471b83370b08` |
| `status/filled/bg/clear` | #dde2e6 | #54606d | `93d33d613eab2d1b4d31a8e619b64b381d72a4e3` |
| `status/filled/text/default` | #0e0f11f2 | #0e0f11f2 | `5019f6f5b7ba914f887b62c93d5edb2e06fd69b2` |
| `status/filled/text/default-inverse` | #0e0f11 | #f0f3f4 | `0949f04c7ab8b91faaa35136172c7e0557957d5e` |
| `status/ghost/bg/default` | #cad1d7 | #4d5661 | `a015840d61d7555752a6d553bfd5a27debbe72d4` |
| `status/ghost/bg/accent` | #fef7b4 | #492c12 | `3a9c3243f8607e33721507cd402401fbef257e79` |
| `status/ghost/bg/success` | #dcfce7 | #093429 | `30ca12f279cfc6d8b82695c4b9449bbc9f03df41` |
| `status/ghost/bg/warning` | #ffedd5 | #542212 | `8600b871f9331691b62a6251c38876f768dfd97b` |
| `status/ghost/bg/error` | #fee2e2 | #4b1124 | `d6976782df00d03acc38f85fc707a23691a6e849` |
| `status/ghost/bg/info` | #e0f2fe | #14234e | `4f0694156bf507c9d8489ac865d0958d83f3c3f0` |
| `status/ghost/bg/clear` | #f4f6f7 | #1f2326 | `4521c8dfedc48ebecfaf00b393f14950b2c93347` |
| `status/ghost/text/default` | #1b1e22 | #dde2e6 | `f051b5799e28331ef340deb471b46ee61886739f` |
| `status/ghost/text/accent` | #713f12 | #d9a607 | `22f5b1784478aaac7409799c7e04470e54eca5c6` |
| `status/ghost/text/success` | #033a29 | #10b981 | `d4e0020199320ae0b6795793a8624f31181dcb6f` |
| `status/ghost/text/warning` | #7c2d12 | #f97316 | `87c8cde7b5048a85bc5f7adecb3450c55e2be986` |
| `status/ghost/text/error` | #881337 | #f43f5e | `b0cd6e709e506da9ec9be38f3ba06fd0aab8a793` |
| `status/ghost/text/info` | #1e3a8a | #60a5fa | `c82074870b69f984cc5be9a4928ef53f3d8e962c` |
| `status/ghost/text/clear` | #1b1e22 | #a9b4bc | `3f7b0a622f408f0da56d95bdc81cd7d204db0cc2` |
| `supportive/filled/1` | #5d6c79 | #5d6c79 | `ad6e033b05a95ceef888b7df75bf1060ff1cb587` |
| `supportive/filled/1-hc` | #768793 | #768793 | `7d58f0fbc6a5b1b97668b0789bf1d5a0fc1864e1` |
| `misc/scrollbar/default` | #00000033 | #ffffff3d | `2276cee9aa3287df8f026cefd51de27aad367d6a` |
| `misc/scrollbar/hover` | #0000003d | #ffffff52 | `b3d0ba9e9831417d7af3fbaa9bae21c9b579e385` |
| `misc/scrollbar/active` | #0000007a | #ffffff7a | `7f849b402015ebc987be8caf4b884e46fabd4207` |
| `misc/overlay/default` | #000000bf | #ffffff7a | `7cbaa01f8f8a3416948ec7a58834a562dc379155` |
| `misc/overlay/blur 0` | #f4f6f759 | #14161959 | `c8c71fb6157ef94ab902baa089ffb65d9c804c0f` |
| `misc/overlay/blur 1` | #eaeef059 | #3a3c4159 | `f97a69cb2a3c4f00db3876f7a6f7171beb10d9d7` |
| `misc/overlay/blur 2` | #d7dce159 | #3f414659 | `fd487333eec6709aaa3447359e628da49f78bad2` |
| `supportive/filled/2` | #f7c21c | #f7c21c | `b4b05bb60a566b12e934113a031100ce7cb0416b` |
| `supportive/filled/2-hc` | #f7c21c | #f7c21c | `6a2ff6a53d156042459110510dfedb6d1970a9b8` |
| `supportive/filled/3` | #10b981 | #059669 | `e8cf9a531d8f5ce6f31f0914dc0cc0f8a1a0ea62` |
| `supportive/filled/3-hc` | #34d399 | #10b981 | `8e8f7e2a4a4eb81ac9e27f5c49018654e8397b6e` |
| `supportive/filled/4` | #ea580c | #ea580c | `a3cd7b5cfd146e94e58f58b0b75aa6539347c05d` |
| `supportive/filled/4-hc` | #f97316 | #f97316 | `98ec2dea9d839c8df3f2e61eef294ff3e4597b61` |
| `supportive/filled/5` | #e11d48 | #e11d48 | `20332c1546b7dae1ff61a602bc9df5a0a7cd44ee` |
| `supportive/filled/5-hc` | #f43f5e | #f43f5e | `f81a37baa9de332d5624fdd92fd658a6fbaf6b97` |
| `supportive/filled/6` | #2563eb | #2563eb | `9e455d107e271b9181ad892fae1bb3ad5a291820` |
| `supportive/filled/6-hc` | #3b82f6 | #3b82f6 | `95e9af210d2e5243337d134234db16f80fe365d3` |
| `supportive/filled/7` | #7c3aed | #7c3aed | `5c42d1ac83e5e05827bce398e0859b61853b9bee` |
| `supportive/filled/7-hc` | #8b5cf6 | #8b5cf6 | `c3119e67298397c0353dc26f4bc3343c1d2eed4e` |
| `supportive/filled/8` | #4f46e5 | #4f46e5 | `6fee4e3e1523a572be5ffa0f28f66bafe20fe15e` |
| `supportive/filled/8-hc` | #6366f1 | #6366f1 | `7c5f439eea40ad61e05a14f071bf7c415b52358d` |
| `supportive/filled/9` | #db2777 | #db2777 | `3a799ae89d05ac0f207c536b4409df418b15bb86` |
| `supportive/filled/9-hc` | #ec4899 | #ec4899 | `747eb9ca9d3cfe18a63907ddb5f1a4b2207ad450` |
| `supportive/filled/10` | #0f766b | #0f766b | `13c034aa449bbd2c49096178a31ed94b7ac94785` |
| `supportive/ghost/1` | #e7e9eb | #2e3236 | `3792dad1e6dec20e68675dcbe5da9eabb675ef92` |
| `supportive/filled/10-hc` | #0d9485 | #0d9485 | `ccb92a2a828bbaa7e547bcfd14251d9311884fb7` |
| `supportive/ghost/2` | #f2ebd4 | #433b1e | `6c8168b02aa970f7b6b94981412622aae4ac4395` |
| `supportive/ghost/3` | #dff1ec | #1a3f37 | `2fe70ff7cd20a95af7a5993310eab993ec943a6f` |
| `supportive/ghost/4` | #f4e7e0 | #462b1f | `82604b98cf358d6f5c4c008c66a0f0c0b464a3bf` |
| `supportive/ghost/5` | #f4e1e6 | #441f2b | `fde585df00890604093b1d6af4b11932096f05f5` |
| `supportive/ghost/6` | #e1e8f7 | #1f2d4c | `5575400919f04f4c4c36efb38492fc1dc8bf68d3` |
| `supportive/ghost/7` | #e9e4f7 | #30254c | `0d61b8f8b0fe06f7338815bafc12eb9204a7bdef` |
| `supportive/ghost/8` | #e5e5f6 | #2a2a54 | `930d0154ef61f47c09b1b8aac9e1d53af3591d78` |
| `supportive/ghost/9` | #f3e2eb | #432135 | `66481078c006617a3eba056480773f8ff20537ec` |
| `supportive/ghost/10` | #deeded | #1a3738 | `02facbf6f327fd1d3b542b2f4ccaf7a305e3af8b` |
| `accent/secondary/clear/default` | #ffffff00 | #26292e00 | `fd1f40c46864a2a2a1f0a16c80561d896fbc9575` |
| `accent/secondary/flat filled/default` | #ffffff | #26292e | `885388b6e4c15303f30384cbc0d0728a42fafc43` |
| `accent/secondary/flat filled/hover` | #e0e5e8 | #2a2d32 | `0b98cf259bae6d23bb8a1db0e097ee6e27bf240f` |
| `accent/secondary/flat filled/active` | #ffffff | #2a2d32 | `5dff4c25a41d22625295184cfcd1eb3ff391d748` |
| `accent/secondary/flat filled/on-accent` | #3b82f6 | #3b82f6 | `4dc980fdb31fb15ec2b77044cc63ccc64bcc1531` |
| `accent/secondary/flat filled/container-muted` | #ffffff | #3a3c41 | `6c122bf0ef75101889a2b3266348ecc1e8aef9b6` |
| `accent/secondary/flat filled/on-accent-muted` | #3b82f6 | #3b82f6 | `8957c3365a44f1eb386cac6d7a3d8067444c1c6e` |
| `accent/secondary/clear/hover` | #e0e5e8 | #2a2d32 | `e1ac136b0bca70dfc827da7aaaa0ab1d820185e1` |
| `accent/secondary/clear/active` | #ffffff00 | #2a2d32 | `7b40a53154d42eddd35caedbbe7b8b024a5395c4` |
| `accent/secondary/clear/on-accent` | #3b82f6 | #3b82f6 | `31a5b466a3ece52eeaaf1e74fbd833e21deaa1a2` |
| `accent/secondary/clear/container-muted` | #ffffff00 | #3a3c4100 | `951bb1a8cb99740b5b1564e7aa6f562ca8005e74` |
| `accent/secondary/clear/on-accent-muted` | #3b82f6 | #ffffff | `6be35fe04e678e4068343463a12b78bc764c811d` |
| `accent/secondary/outline/default` | #bfdbfe | #2563eb | `d5d9d4dbb9d32e0de4988fa1f5a1758e3d957e60` |
| `accent/secondary/outline/hover` | #93c5fd | #1d4ed8 | `289c71271be74888d006a027a492ce86f72aff97` |
| `accent/secondary/outline/active` | #bfdbfe | #2563eb | `078061ee00916af6074c7165c53e3c7b7d4deeb5` |
| `accent/secondary/outline/on-accent` | #3b82f6 | #3b82f6 | `9239241cc2ede419c9bd254ffcf879607053f7fc` |
| `accent/secondary/outline/container-muted` | #eff6ff | #1e40af | `67947bcec00e9caa270ce55a34ba9ae4e6ad2122` |
| `background/onsurface/0-inverse-soft` | #ffffff | #4d5661 | `391c55c48db5284cd79177cf36f8c77a16b7ffb7` |

## 4. Brands: 1.brand modes

Switch the product with `setExplicitVariableModeForCollection` on the screen frame. `brand/*` in 2.theme (e.g. `text/brand`, `border/accent/brand`) follow it.

| Variable | bank | kassa | travel | artwin | koko | key |
|---|---|---|---|---|---|---|
| `brand/default` | #16a34a | #2563eb | #60a5fa | #fddb2b | #da78f2 | `3fcd6d12c7cc69c1234f116a3814b8add7ab2497` |
| `brand/hover` | #189547 | #1d4ed8 | #4d9af9 | #f7c21c | #f7c21c | `82a3be583bee1e54a9820a88b176bc1a0609fa2c` |
| `brand/active` | #16a34a | #1d4ed8 | #60a5fa | #fddb2b | #fddb2b | `1b3f03e7755cc15e0cbdac50e402785669ce1825` |
| `brand/on-accent` | #ffffff | #ffffff | #ffffff | #0e0f11 | #0e0f11 | `9ee77db9b335856989165e8f70a4c08b1fd42b07` |
| `brand/on-accent-muted` | #a9b4bc | #a9b4bc | #a9b4bc | #a9b4bc | #a9b4bc | `7dcb7080f888546265c5196924993c42cc2bf41b` |
| `brand/container-muted` | #f0f3f4 | #f0f3f4 | #f0f3f4 | #f0f3f4 | #f0f3f4 | `e78d2a11607d7e68ba3c17c4559abc03bafd65f6` |
| `brand/ghost-default` | #f0fdf4 | #dbeafe | #eff6ff | #fef7b4 | #fef7b4 | `618558efb4b8526fe7d694f6cef6c786da1614d1` |
| `brand/ghost-hover` | #e8fcee | #bfdbfe | #e5f1ff | #fef08a | #fef08a | `94afb4debb19af70507fb5070792ff6cf8245d62` |
| `brand/ghost-active` | #f0fdf4 | #dbeafe | #eff6ff | #fef7b4 | #fef7b4 | `5409c22ed2729aa2ca5adc39504f2151152e9ff3` |
| `brand/ghost-on-accent-muted` | #86efac | #3b82f6 | #93c5fd | #f7c21c | #f7c21c | `4e1ccb3eaf0bbf9f541aebbac32471c813c2a7ab` |
| `brand/ghost-container-muted` | #f0fdf4 | #eff6ff | #eff6ff | #fefce8 | #fefce8 | `3920f79f5f81b23546281bde748ac4a909a1608d` |
| `brand/ghost-on-accent` | #16a34a | #1d4ed8 | #60a5fa | #d9a607 | #d9a607 | `3a014360ef561bd9d8459ba4a7852757ec660bfc` |

Collection key `ee03d86acd483fa09af50c5e7991fa4571108624`. Mode names: `bank`, `kassa`, `travel`, `artwin` (its first letter in Figma is not plain Latin: find it with `m.name.includes("rtwin")`), `koko`.

## 5. Text styles

### Mobile KIT (Nunito)

| Style | Weight | Size/LH | key |
|---|---|---|---|
| `display/large` | Black | 56/68 | `935eecfccf8f19e0b0b07db993694abd68d7d6fa` |
| `display/medium` | ExtraBold | 44/56 | `77389d3ebaea2c5a0e51c9888d13085cc2a06625` |
| `display/small` | ExtraBold | 36/48 | `fbc14f8cc8d7ec20ed34ef6c9035d7c32a6d71c8` |
| `headline/large` | Bold | 32/40 | `42bd51967686fee5ca4ccc96538ce60fa5058d69` |
| `headline/medium` | Bold | 28/36 | `dabf12c1016d1f2ad529f2b44c76a7cfc2f129f1` |
| `headline/small` | Bold | 24/32 | `cf5b068f4264ad7d2cab1343d5c8e995964607b8` |
| `title/large 2` | Bold | 22/28 | `cda42c331c76712c19b4f260be17b2b28e62460a` |
| `title/large 1` | Bold | 18/24 | `e25d51b8915eb2d26b659620aef2f06e3199dddc` |
| `title/medium` | Bold | 16/24 | `5e00391d94336064ae90578d9b2d488f6ae30edd` |
| `title/small` | Bold | 14/20 | `8ad541a9910d966f41fd18c4b134828a01224a61` |
| `body/large` | Medium | 16/24 | `0b0bc64ef8b5dc133fd1194d126f262df2a930ae` |
| `body/medium` | Medium | 14/20 | `6f67996c8bfa4eddc6c219cb559800ba1d1bb590` |
| `body/small` | Medium | 12/16 | `43a4ed0fc2a0718be0f2e2c509ddcb620c93e3e9` |
| `label/large-prominent` | Bold | 16/24 | `e4778cf7733078e9b75f0532853aa9a55ed05ac5` |
| `label/large` | Medium | 16/24 | `b5146d924829d4afbc81cdf4802c39a15b59c203` |
| `label/medium-prominent` | Bold | 14/20 | `37add98b49257c926e19f1e45381f502e2be451b` |
| `label/medium` | SemiBold | 14/20 | `22b70c3f6ff11d198c6043879ea2977f3e07bdf2` |
| `label/small m - prominent` | Bold | 13/16 | `83d85bcafe0b51a3656ddc48731726188143c838` |
| `label/small m` | Medium | 13/16 | `c6f52356a7c782670153ff55cdfbf3456849fd3e` |
| `label/small s - prominent` | Bold | 12/14 | `81d7ea4c0dfcebb6fe7a9dfd9793bdafbb8e52e1` |
| `label/small s` | Medium | 12/14 | `d5105b04b8c92621288b5c6a8d59e5356979c571` |

### Web components (Inter Mbank)

| Style | Weight | Size/LH | key |
|---|---|---|---|
| `font/Display/l` | Regular | 72/88 | `e316e5b34dae81e60cc2ab97a1ab8cdef4563a98` |
| `font/Display/l-md` | SemiBold | 72/88 | `5ab7b80c54c4507d649b6306dd3e61b8f1721230` |
| `font/Display/l-strong` | Bold | 72/88 | `9b0ca8f78c395d4698e06d129e87dee3e6ead2b5` |
| `font/Display/m` | Medium | 56/68 | `3e023dd0da2e1e176c3187b68196a6586d802b8a` |
| `font/Display/m-md` | SemiBold | 56/68 | `6fd5a97d91cc9a9de866ac0f36f7ad642b2d2b05` |
| `font/Display/m-strong` | Bold | 56/68 | `a95b07a2b43f24aa401f1ef8c1b32b489149392f` |
| `font/Display/s` | Medium | 48/56 | `6b7f650ff27b4c6c9d69163260725f86cfd4fca2` |
| `font/Display/s-md` | SemiBold | 48/56 | `e06696cc2138f91849ecab3b1db9f94381d41b82` |
| `font/Display/s-strong` | Bold | 48/56 | `c249d0bd029a93d6d6923dbf531dde2d3e4e11fe` |
| `font/Heading/h1` | Bold | 44/52 | `e08e01dab2c6eb1e477b5e7bc9fd8bb7de4fd8a3` |
| `font/Heading/h2` | Bold | 44/52 | `69b9a4ac3a851a758d18a02b4a29af33ecb256ad` |
| `font/Heading/h3` | Bold | 32/40 | `23dc9ab4ba71b905aa555d4aa563e364598fa40c` |
| `font/Heading/h4` | Bold | 24/32 | `3c1db2e1820e70adce82a63dc504382b52ee759a` |
| `font/Heading/h5` | Bold | 20/28 | `d42185ecec5526dbd0305063826a760364c56df0` |
| `font/Heading/h6` | Bold | 16/24 | `6fb93a2cc4474df73cd2ae1bbd7d6d9b041e835f` |
| `font/Body/xl` | Regular | 18/26 | `aa8b7fbaa97839c3510a2fe501e42b210d3a872e` |
| `font/Body/xl-md` | Medium | 18/26 | `07863401d95c6f432ee9a03758fa0fc226d159ab` |
| `font/Body/xl-strong` | Bold | 18/26 | `9be63943b5c7f6b88df6340c47e73a3d6d2728fe` |
| `font/Body/l` | Regular | 16/24 | `98dc7c792e61f09be4d5f519634aada8b52cfcd3` |
| `font/Body/l-md` | Medium | 16/24 | `a7b3a781c611400a807bdee354a39c3736df09bd` |
| `font/Body/l-strong` | Bold | 16/24 | `cac77d0fc4391374fa731efc663cc720e5049da4` |
| `font/Body/m` | Regular | 15/22 | `4d1b7e47cbc9fc3531246736359f2c9325535de6` |
| `font/Body/m-md` | Medium | 15/22 | `a52537e7e015a8c7a857ad4c3c1527c811d582d1` |
| `font/Body/m-strong` | Bold | 15/22 | `473c82346b61cca42405ac66ec8888a5ceaa5112` |
| `font/Body/s` | Regular | 14/20 | `476f8d56a3c3bcaa804a33fd3658f73dbbb06fa3` |
| `font/Body/s-md` | Medium | 14/20 | `6ebb3dab78e706c0f2ee21bd5fd79999aecc4862` |
| `font/Body/s-strong` | Bold | 14/20 | `8f1f4e2617b460a9982399f453c4d9baa952dc45` |
| `font/Body/xs` | Regular | 13/16 | `8850f7044628d2c0d22dd32323557ea8baa5e178` |
| `font/Body/xs-md` | Medium | 13/16 | `aa171a29710200f383227c5de81e8ac07bd72ed0` |
| `font/Body/xs-strong` | Bold | 13/16 | `fe0bc48b745d27ee08208ae8f35afda3e8206bd5` |
| `font/Label/l` | Regular | 14/16 | `7a128f79cc1cd1422c65b1e8787741357c438ea9` |
| `font/Label/m` | Regular | 12/16 | `5ce2601a5d83c46550be0cc8999693e275c7c5f5` |
| `font/Label/s` | Regular | 11/14 | `8fc90fb03d6fad3a47f660345698efd4b84e9c0d` |
| `font/description/l` | Regular | 13/16 | `7d16943d07753ab98f3f8c03a62e2e09a07274df` |
| `font/description/l-strong` | SemiBold | 13/16 | `f36e178caa81d1327daca41ec2433253fdf4181e` |
| `font/description/m` | Regular | 12/16 | `f0df2a3cba519550cdc24d7c51281fa594092871` |
| `font/description/m-strong` | SemiBold | 12/16 | `cf52afe4f832a6b223ccd031fbbf36ec42aa44fd` |
| `font/description/s` | Regular | 11/14 | `9d9978915ce26a75add453d62bdc2b2838c015a4` |
| `font/description/s-strong` | SemiBold | 11/14 | `b5a2d7494f74f33a5f8cdff6262e4aeffa9020f3` |

## 6. Effect styles

| Kit | Style | Effects | key |
|---|---|---|---|
| mobile | `blocks/elevateBlocks` | DROP_SHADOW 0,4 r20 | `af66c8cb44215b21732f55a594ff6ea5fb61b200` |
| mobile | `shadow/Default` | DROP_SHADOW 0,4 r24 | `cf3f2c1cec4b9973388dc957f2e14b4b5f4bc21a` |
| mobile | `shadow/Default-hover` | DROP_SHADOW 0,12 r36 | `2e66027ce4ce5d9243511b148dfa32362623d3ce` |
| mobile | `shadow/dropdown` | DROP_SHADOW 0,3 r6 + 0,11 r11 + 0,25 r15 | `52cf274a237c77f957b26bdfb8f8d9743c267d70` |
| mobile | `shadow/notification` | DROP_SHADOW 0,8 r16 | `53bfc4ffe3cf10e1aba5abcca629f8c3845b6fe5` |
| mobile | `shadow/modal` | DROP_SHADOW 0,18 r30 | `b19fb1c69429a6e20e310a26b4def93ba35906fe` |
| mobile | `shadow/tooltip` | DROP_SHADOW 0,4 r6 + 0,12 r12 + 0,24 r16 + 0,0 r2 | `4564637f5cbcb2c09bbbfdda19dab7782e391b7a` |
| web | `shadow/none` | none | `8acf8b7a42bf5700ba96fedbb871bf5819f783e4` |
| web | `shadow/Default` | DROP_SHADOW 0,4 r24 | `4022ed1f609ecc4e8d56143d3dc583270da14404` |
| web | `shadow/Default-hover` | DROP_SHADOW 0,12 r36 | `3ba21a75473937d8cea9b629aaa9b32420f87e18` |
| web | `shadow/dropdown` | DROP_SHADOW 0,3 r6 + 0,11 r11 + 0,15 r35 | `fee84674c72640e71ad87cb7242bfcf66a529d1c` |
| web | `shadow/notification` | DROP_SHADOW 0,8 r16 | `0849c663f3bd667083617a09592b8eb9ed1d8c36` |
| web | `shadow/modal` | DROP_SHADOW 0,18 r30 | `f584a1bc29d2235b8d036666788a22be86abb4e2` |
| web | `shadow/tooltip` | DROP_SHADOW 0,4 r6 + 0,12 r12 + 0,24 r16 + 0,0 r2 | `7b6ebd53cddd6da1b80df822729b4cebaa48371c` |
| web | `shadow/bottom/controls` | DROP_SHADOW 0,2 r2 + 0,0 r1 | `fd6ac19b432ce73bce36e50f41f509a627ce9d44` |
| web | `shadow/bottom/s` | DROP_SHADOW 0,2 r4 + 0,0 r8 | `d444bf9240ed99ea2f21d5c33ec2a73140e68430` |
| web | `shadow/bottom/m` | DROP_SHADOW 0,4 r8 + 0,0 r16 | `c867ef24d0e44cc0cebb1741884cf3e2cada237b` |
| web | `shadow/bottom/l` | DROP_SHADOW 0,12 r20 + 0,0 r20 | `801a169f55b5f3a890cba9c9860ad4a3cdab5e3e` |
| web | `shadow/bottom/xl` | DROP_SHADOW 0,32 r32 + 0,0 r32 | `62bddc7abd7015237fd174f6c0e7700d63b3ff77` |
| web | `shadow/top/controls` | DROP_SHADOW 0,-2 r2 + 0,0 r1 | `0bbbacb7185609e64d65b0b4b7cb329595a56a0d` |
| web | `shadow/top/s` | DROP_SHADOW 0,-2 r4 + 0,0 r8 | `4a873714e2dee817fadf03d129e5fe32617f87ac` |
| web | `shadow/top/m` | DROP_SHADOW 0,-4 r8 + 0,0 r16 | `668b437ab010a6dfbd2d3f7c25c6759aa8c3d0a4` |
| web | `shadow/top/l` | DROP_SHADOW 0,-12 r20 + 0,0 r20 | `6274b8e4cc57b6491cb734f26a448590dfb16d61` |
| web | `shadow/top/xl` | DROP_SHADOW 0,-32 r32 + 0,0 r32 | `e94d19faf070d3aaffd4bf9239eb1814df5a9b24` |

Web components publishes every shadow twice; the keys above are the first copy.
