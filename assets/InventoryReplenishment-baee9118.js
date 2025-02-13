import{_ as Y,G as Z,r as c,a as T,o as ee,c as o,n as te,d as k,e as z,f as t,w as n,E as m,g as u,F as ae,p as le,i as p,q as ne,h as N,t as q,j as oe,l as re}from"./index-bbf05c48.js";const se={class:"inventory-replenishment"},de={class:"product-option"},ue={class:"stock-info"},ie={class:"pagination"},pe={__name:"InventoryReplenishment",setup(ce){const P=Z(),g=c(!1),y=c(!1),f=c(null),h=[{code:"P001",name:"无人机A型",quantity:5,minQuantity:10},{code:"P002",name:"专业航拍镜头",quantity:20,minQuantity:15}],v=c(0),b=c(0),r=T({productId:"",quantity:1,expectedDate:"",reason:"",remark:""}),s=T({currentPage:1,pageSize:10,total:0}),C=c([]),U={productId:[{required:!0,message:"请选择商品",trigger:"change"}],quantity:[{required:!0,message:"请输入申请数量",trigger:"blur"},{type:"number",min:1,message:"申请数量必须大于0",trigger:"blur"}],expectedDate:[{required:!0,message:"请选择期望到货日期",trigger:"change"}],reason:[{required:!0,message:"请输入补货原因",trigger:"blur"}]},R=l=>l.getTime()<Date.now(),B=l=>({pending:"warning",approved:"success",rejected:"danger",cancelled:"info"})[l]||"",M=l=>({pending:"待审核",approved:"已通过",rejected:"已驳回",cancelled:"已取消"})[l]||l,D=l=>{const e=h.find(x=>x.code===l);e&&(v.value=e.quantity,b.value=e.minQuantity)},F=l=>{s.pageSize=l,_()},E=l=>{s.currentPage=l,_()},j=async()=>{if(f.value)try{await f.value.validate(),y.value=!0,await new Promise(l=>setTimeout(l,1e3)),m.success("补货申请提交成功"),S(),_()}catch{m.error("表单验证失败，请检查必填项")}finally{y.value=!1}},S=()=>{var l;(l=f.value)==null||l.resetFields(),v.value=0,b.value=0},A=l=>{re.confirm("确定要取消该补货申请吗？","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(async()=>{g.value=!0;try{await new Promise(e=>setTimeout(e,1e3)),m.success("申请已取消"),_()}catch{m.error("操作失败")}finally{g.value=!1}})},Q=l=>{m("查看详情："+l.applyNo)},_=async()=>{g.value=!0;try{await new Promise(l=>setTimeout(l,1e3)),C.value=[{applyNo:"R202401150001",productName:"无人机A型",quantity:10,expectedDate:"2024-01-20",status:"pending",applyTime:"2024-01-15 14:30:00"},{applyNo:"R202401140001",productName:"专业航拍镜头",quantity:5,expectedDate:"2024-01-18",status:"approved",applyTime:"2024-01-14 10:00:00"}],s.total=20}catch{m.error("加载数据失败")}finally{g.value=!1}};return ee(()=>{const l=P.query.productId;l&&(r.productId=l,D(l)),_()}),(l,e)=>{const x=o("el-option"),L=o("el-select"),d=o("el-form-item"),w=o("el-input"),$=o("el-input-number"),G=o("el-date-picker"),V=o("el-button"),O=o("el-form"),I=o("el-card"),i=o("el-table-column"),H=o("el-tag"),J=o("el-table"),K=o("el-pagination"),W=te("loading");return k(),z("div",se,[t(I,{class:"form-card"},{header:n(()=>e[9]||(e[9]=[u("div",{class:"card-header"},[u("h2",null,"补货申请")],-1)])),default:n(()=>[t(O,{ref_key:"formRef",ref:f,model:r,rules:U,"label-width":"120px"},{default:n(()=>[t(d,{label:"商品选择",prop:"productId"},{default:n(()=>[t(L,{modelValue:r.productId,"onUpdate:modelValue":e[0]||(e[0]=a=>r.productId=a),filterable:"",placeholder:"请选择商品",onChange:D,style:{width:"100%"}},{default:n(()=>[(k(),z(ae,null,le(h,a=>t(x,{key:a.code,label:a.name,value:a.code},{default:n(()=>[u("div",de,[u("span",null,q(a.name),1),u("span",ue," 当前库存: "+q(a.quantity),1)])]),_:2},1032,["label","value"])),64))]),_:1},8,["modelValue"])]),_:1}),t(d,{label:"当前库存"},{default:n(()=>[t(w,{modelValue:v.value,"onUpdate:modelValue":e[1]||(e[1]=a=>v.value=a),disabled:""},{append:n(()=>e[10]||(e[10]=[p("件")])),_:1},8,["modelValue"])]),_:1}),t(d,{label:"最低库存"},{default:n(()=>[t(w,{modelValue:b.value,"onUpdate:modelValue":e[2]||(e[2]=a=>b.value=a),disabled:""},{append:n(()=>e[11]||(e[11]=[p("件")])),_:1},8,["modelValue"])]),_:1}),t(d,{label:"申请数量",prop:"quantity"},{default:n(()=>[t($,{modelValue:r.quantity,"onUpdate:modelValue":e[3]||(e[3]=a=>r.quantity=a),min:1,precision:0,style:{width:"100%"}},null,8,["modelValue"])]),_:1}),t(d,{label:"期望到货日期",prop:"expectedDate"},{default:n(()=>[t(G,{modelValue:r.expectedDate,"onUpdate:modelValue":e[4]||(e[4]=a=>r.expectedDate=a),type:"date",placeholder:"选择日期","disabled-date":R,style:{width:"100%"}},null,8,["modelValue"])]),_:1}),t(d,{label:"补货原因",prop:"reason"},{default:n(()=>[t(w,{modelValue:r.reason,"onUpdate:modelValue":e[5]||(e[5]=a=>r.reason=a),type:"textarea",rows:3,placeholder:"请说明补货原因"},null,8,["modelValue"])]),_:1}),t(d,{label:"备注说明",prop:"remark"},{default:n(()=>[t(w,{modelValue:r.remark,"onUpdate:modelValue":e[6]||(e[6]=a=>r.remark=a),type:"textarea",rows:3,placeholder:"请输入备注说明"},null,8,["modelValue"])]),_:1}),t(d,null,{default:n(()=>[t(V,{type:"primary",onClick:j,loading:y.value},{default:n(()=>e[12]||(e[12]=[p(" 提交申请 ")])),_:1},8,["loading"]),t(V,{onClick:S,disabled:y.value},{default:n(()=>e[13]||(e[13]=[p("重置")])),_:1},8,["disabled"])]),_:1})]),_:1},8,["model"])]),_:1}),t(I,{class:"list-card"},{header:n(()=>e[14]||(e[14]=[u("div",{class:"card-header"},[u("h2",null,"申请记录")],-1)])),default:n(()=>[ne((k(),N(J,{data:C.value,style:{width:"100%"}},{default:n(()=>[t(i,{prop:"applyNo",label:"申请编号",width:"180"}),t(i,{prop:"productName",label:"商品名称","min-width":"180","show-overflow-tooltip":""}),t(i,{prop:"quantity",label:"申请数量",width:"120"}),t(i,{prop:"expectedDate",label:"期望到货日期",width:"180"}),t(i,{prop:"status",label:"状态",width:"120"},{default:n(({row:a})=>[t(H,{type:B(a.status)},{default:n(()=>[p(q(M(a.status)),1)]),_:2},1032,["type"])]),_:1}),t(i,{prop:"applyTime",label:"申请时间",width:"180",sortable:""}),t(i,{label:"操作",width:"120",fixed:"right"},{default:n(({row:a})=>[a.status==="pending"?(k(),N(V,{key:0,link:"",type:"danger",onClick:X=>A(a)},{default:n(()=>e[15]||(e[15]=[p(" 取消 ")])),_:2},1032,["onClick"])):oe("",!0),t(V,{link:"",type:"primary",onClick:X=>Q(a)},{default:n(()=>e[16]||(e[16]=[p(" 详情 ")])),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"])),[[W,g.value]]),u("div",ie,[t(K,{"current-page":s.currentPage,"onUpdate:currentPage":e[7]||(e[7]=a=>s.currentPage=a),"page-size":s.pageSize,"onUpdate:pageSize":e[8]||(e[8]=a=>s.pageSize=a),"page-sizes":[10,20,50,100],total:s.total,layout:"total, sizes, prev, pager, next",onSizeChange:F,onCurrentChange:E},null,8,["current-page","page-size","total"])])]),_:1})])}}},ge=Y(pe,[["__scopeId","data-v-cfdb890e"]]);export{ge as default};
