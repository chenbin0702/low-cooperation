import{_ as me,r as R,a as A,o as pe,b as ce,c as d,d as i,e as _,f as t,w as l,g as u,h as F,i as m,j as y,k as fe,F as V,p as k,t as q,E as I,l as _e,s as L,D as ge,C as ve}from"./index-bbf05c48.js";const ye={class:"order-create"},be={class:"card-header"},Ve={class:"form-section"},ke={class:"form-section"},qe={class:"form-section"},Ie={key:0,class:"order-items"},we={style:{float:"right",color:"#8492a6","font-size":"13px"}},Ce={key:1,class:"rental-info"},Te={style:{float:"right",color:"#8492a6","font-size":"13px"}},Ue={key:2,class:"service-info"},he={class:"form-section"},De={class:"order-total"},Oe={class:"total-amount"},Se={class:"form-actions"},Be={__name:"OrderCreate",setup(xe){const w=R(null),C=R(!1),T=R(!1),U=A({isDraft:!1,lastSaved:null}),Q=[{label:"示例客户1",value:"customer1"},{label:"示例客户2",value:"customer2"}],D=[{id:1,name:"无人机A型",price:29999,stock:10},{id:2,name:"无人机B型",price:39999,stock:5},{id:3,name:"配件套装",price:1999,stock:50}],O=[{id:1,name:"专业航拍无人机",dailyRate:999,available:!0},{id:2,name:"测绘无人机",dailyRate:1299,available:!0},{id:3,name:"植保无人机",dailyRate:899,available:!1}],E=[{id:1,name:"航拍服务",price:5e3},{id:2,name:"测绘服务",price:8e3},{id:3,name:"培训服务",price:3e3}],a=A({customer:{name:"",contact:"",phone:"",address:""},orderType:"product",items:[{productId:"",quantity:1,price:0,total:0}],rental:{equipmentId:"",duration:1,fee:0},service:{serviceId:"",fee:0,requirements:""},deliveryDate:"",remarks:""}),G={"customer.name":[{required:!0,message:"请选择客户",trigger:"change"}],"customer.contact":[{required:!0,message:"请输入联系人",trigger:"blur"}],"customer.phone":[{required:!0,message:"请输入联系电话",trigger:"blur"},{pattern:/^1[3-9]\d{9}$/,message:"请输入正确的手机号码",trigger:"blur"}],"customer.address":[{required:!0,message:"请输入收货地址",trigger:"blur"}],orderType:[{required:!0,message:"请选择订单类型",trigger:"change"}],"rental.equipmentId":[{required:!0,message:"请选择租赁设备",trigger:"change"}],"rental.duration":[{required:!0,message:"请输入租赁时间",trigger:"blur"},{type:"number",min:1,message:"租赁时间必须大于0",trigger:"blur"}],"service.serviceId":[{required:!0,message:"请选择服务项目",trigger:"change"}],"service.requirements":[{required:!0,message:"请输入服务要求",trigger:"blur"}],deliveryDate:[{required:!0,message:"请选择预计交付日期",trigger:"change"}]};let S=null;const H=o=>{const e={contact:"张三",phone:"13800138000",address:"上海市浦东新区XX路XX号"};a.customer.contact=e.contact,a.customer.phone=e.phone,a.customer.address=e.address},M=()=>{a.orderType==="product"?a.items=[{productId:"",quantity:1,price:0,total:0}]:a.orderType==="rental"?a.rental={equipmentId:"",duration:1,fee:0}:a.service={serviceId:"",fee:0,requirements:""}},J=(o,e)=>{const c=D.find(v=>v.id===o);c&&(a.items[e].price=c.price,N(e))},K=o=>{O.find(c=>c.id===o)&&X()},W=o=>{const e=E.find(c=>c.id===o);e&&(a.service.fee=e.price)},N=o=>{const e=a.items[o];e.total=e.price*e.quantity},X=()=>{const o=O.find(e=>e.id===a.rental.equipmentId);o&&(a.rental.fee=o.dailyRate*a.rental.duration)},Y=o=>{const e=D.find(c=>c.id===o.productId);return e?e.stock:1},Z=()=>{a.items.push({productId:"",quantity:1,price:0,total:0})},ee=o=>{a.items.splice(o,1)},te=()=>a.orderType==="product"?a.items.reduce((o,e)=>o+e.total,0):a.orderType==="rental"?a.rental.fee:a.service.fee,le=o=>o.getTime()<Date.now(),ae=async()=>{if(w.value)try{await w.value.validate(),C.value=!0,await new Promise(o=>setTimeout(o,1e3)),I.success("订单提交成功"),$()}catch{I.error("表单验证失败，请检查必填项")}finally{C.value=!1}},P=async()=>{T.value=!0;try{await new Promise(o=>setTimeout(o,1e3)),U.isDraft=!0,U.lastSaved=new Date,I.success("草稿保存成功")}catch{I.error("保存失败")}finally{T.value=!1}},$=()=>{_e.confirm("确定要重置表单吗？所有未保存的内容将丢失。","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{var o;(o=w.value)==null||o.resetFields(),M(),I.success("表单已重置")})},re=()=>{U.isDraft||P()};return pe(()=>{S=setInterval(re,3e5)}),ce(()=>{S&&clearInterval(S)}),(o,e)=>{const c=d("el-tag"),v=d("el-option"),h=d("el-select"),n=d("el-form-item"),g=d("el-input"),B=d("el-radio"),oe=d("el-radio-group"),f=d("el-col"),z=d("el-input-number"),j=d("el-icon"),b=d("el-button"),x=d("el-row"),ne=d("el-date-picker"),se=d("el-descriptions-item"),de=d("el-descriptions"),ue=d("el-form"),ie=d("el-card");return i(),_("div",ye,[t(ie,{class:"order-card"},{header:l(()=>[u("div",be,[e[15]||(e[15]=u("h2",null,"创建订单",-1)),U.isDraft?(i(),F(c,{key:0,type:"info"},{default:l(()=>e[14]||(e[14]=[m("草稿已保存")])),_:1})):y("",!0)])]),default:l(()=>[t(ue,{ref_key:"formRef",ref:w,model:a,rules:G,"label-width":"120px",onSubmit:e[13]||(e[13]=fe(()=>{},["prevent"]))},{default:l(()=>[u("div",Ve,[e[16]||(e[16]=u("h3",null,"客户信息",-1)),t(n,{label:"客户名称",prop:"customer.name"},{default:l(()=>[t(h,{modelValue:a.customer.name,"onUpdate:modelValue":e[0]||(e[0]=r=>a.customer.name=r),filterable:"",placeholder:"请选择客户",onChange:H,style:{width:"100%"}},{default:l(()=>[(i(),_(V,null,k(Q,r=>t(v,{key:r.value,label:r.label,value:r.value},null,8,["label","value"])),64))]),_:1},8,["modelValue"])]),_:1}),t(n,{label:"联系人",prop:"customer.contact"},{default:l(()=>[t(g,{modelValue:a.customer.contact,"onUpdate:modelValue":e[1]||(e[1]=r=>a.customer.contact=r)},null,8,["modelValue"])]),_:1}),t(n,{label:"联系电话",prop:"customer.phone"},{default:l(()=>[t(g,{modelValue:a.customer.phone,"onUpdate:modelValue":e[2]||(e[2]=r=>a.customer.phone=r)},null,8,["modelValue"])]),_:1}),t(n,{label:"收货地址",prop:"customer.address"},{default:l(()=>[t(g,{modelValue:a.customer.address,"onUpdate:modelValue":e[3]||(e[3]=r=>a.customer.address=r),type:"textarea",rows:2},null,8,["modelValue"])]),_:1})]),u("div",ke,[e[20]||(e[20]=u("h3",null,"订单类型",-1)),t(n,{label:"订单类型",prop:"orderType"},{default:l(()=>[t(oe,{modelValue:a.orderType,"onUpdate:modelValue":e[4]||(e[4]=r=>a.orderType=r),onChange:M},{default:l(()=>[t(B,{label:"product"},{default:l(()=>e[17]||(e[17]=[m("商品购买")])),_:1}),t(B,{label:"rental"},{default:l(()=>e[18]||(e[18]=[m("设备租赁")])),_:1}),t(B,{label:"service"},{default:l(()=>e[19]||(e[19]=[m("服务订单")])),_:1})]),_:1},8,["modelValue"])]),_:1})]),u("div",qe,[e[26]||(e[26]=u("h3",null,"订单明细",-1)),a.orderType==="product"?(i(),_("div",Ie,[(i(!0),_(V,null,k(a.items,(r,p)=>(i(),_("div",{key:p,class:"order-item"},[t(x,{gutter:20},{default:l(()=>[t(f,{span:8},{default:l(()=>[t(n,{label:p===0?"商品选择":"",prop:"items."+p+".productId",rules:{required:!0,message:"请选择商品",trigger:"change"}},{default:l(()=>[t(h,{modelValue:r.productId,"onUpdate:modelValue":s=>r.productId=s,placeholder:"请选择商品",onChange:s=>J(s,p),style:{width:"100%"}},{default:l(()=>[(i(),_(V,null,k(D,s=>t(v,{key:s.id,label:s.name,value:s.id},{default:l(()=>[u("span",null,q(s.name),1),u("span",we," 库存: "+q(s.stock),1)]),_:2},1032,["label","value"])),64))]),_:2},1032,["modelValue","onUpdate:modelValue","onChange"])]),_:2},1032,["label","prop"])]),_:2},1024),t(f,{span:5},{default:l(()=>[t(n,{label:p===0?"数量":"",prop:"items."+p+".quantity",rules:[{required:!0,message:"请输入数量",trigger:"blur"},{type:"number",min:1,message:"数量必须大于0",trigger:"blur"}]},{default:l(()=>[t(z,{modelValue:r.quantity,"onUpdate:modelValue":s=>r.quantity=s,min:1,max:Y(r),onChange:s=>N(p),style:{width:"100%"}},null,8,["modelValue","onUpdate:modelValue","max","onChange"])]),_:2},1032,["label","prop"])]),_:2},1024),t(f,{span:5},{default:l(()=>[t(n,{label:p===0?"单价":""},{default:l(()=>[t(g,{modelValue:r.price,"onUpdate:modelValue":s=>r.price=s,disabled:""},{append:l(()=>e[21]||(e[21]=[m("元")])),_:2},1032,["modelValue","onUpdate:modelValue"])]),_:2},1032,["label"])]),_:2},1024),t(f,{span:5},{default:l(()=>[t(n,{label:p===0?"小计":""},{default:l(()=>[t(g,{modelValue:r.total,"onUpdate:modelValue":s=>r.total=s,disabled:""},{append:l(()=>e[22]||(e[22]=[m("元")])),_:2},1032,["modelValue","onUpdate:modelValue"])]),_:2},1032,["label"])]),_:2},1024),t(f,{span:1,class:"item-actions"},{default:l(()=>[p===a.items.length-1?(i(),F(b,{key:0,type:"primary",link:"",onClick:Z},{default:l(()=>[t(j,null,{default:l(()=>[t(L(ge))]),_:1})]),_:1})):y("",!0),a.items.length>1?(i(),F(b,{key:1,type:"danger",link:"",onClick:s=>ee(p)},{default:l(()=>[t(j,null,{default:l(()=>[t(L(ve))]),_:1})]),_:2},1032,["onClick"])):y("",!0)]),_:2},1024)]),_:2},1024)]))),128))])):y("",!0),a.orderType==="rental"?(i(),_("div",Ce,[t(x,{gutter:20},{default:l(()=>[t(f,{span:8},{default:l(()=>[t(n,{label:"租赁设备",prop:"rental.equipmentId"},{default:l(()=>[t(h,{modelValue:a.rental.equipmentId,"onUpdate:modelValue":e[5]||(e[5]=r=>a.rental.equipmentId=r),placeholder:"请选择设备",onChange:K,style:{width:"100%"}},{default:l(()=>[(i(),_(V,null,k(O,r=>t(v,{key:r.id,label:r.name,value:r.id},{default:l(()=>[u("span",null,q(r.name),1),u("span",Te,q(r.available?"可租赁":"已租出"),1)]),_:2},1032,["label","value"])),64))]),_:1},8,["modelValue"])]),_:1})]),_:1}),t(f,{span:8},{default:l(()=>[t(n,{label:"租赁时间",prop:"rental.duration"},{default:l(()=>[t(z,{modelValue:a.rental.duration,"onUpdate:modelValue":e[6]||(e[6]=r=>a.rental.duration=r),min:1,onChange:X,style:{width:"100%"}},{append:l(()=>e[23]||(e[23]=[m("天")])),_:1},8,["modelValue"])]),_:1})]),_:1}),t(f,{span:8},{default:l(()=>[t(n,{label:"租赁费用"},{default:l(()=>[t(g,{modelValue:a.rental.fee,"onUpdate:modelValue":e[7]||(e[7]=r=>a.rental.fee=r),disabled:""},{append:l(()=>e[24]||(e[24]=[m("元")])),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})])):y("",!0),a.orderType==="service"?(i(),_("div",Ue,[t(x,{gutter:20},{default:l(()=>[t(f,{span:12},{default:l(()=>[t(n,{label:"服务项目",prop:"service.serviceId"},{default:l(()=>[t(h,{modelValue:a.service.serviceId,"onUpdate:modelValue":e[8]||(e[8]=r=>a.service.serviceId=r),placeholder:"请选择服务",onChange:W,style:{width:"100%"}},{default:l(()=>[(i(),_(V,null,k(E,r=>t(v,{key:r.id,label:r.name,value:r.id},null,8,["label","value"])),64))]),_:1},8,["modelValue"])]),_:1})]),_:1}),t(f,{span:12},{default:l(()=>[t(n,{label:"服务费用"},{default:l(()=>[t(g,{modelValue:a.service.fee,"onUpdate:modelValue":e[9]||(e[9]=r=>a.service.fee=r),disabled:""},{append:l(()=>e[25]||(e[25]=[m("元")])),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1}),t(n,{label:"服务要求",prop:"service.requirements"},{default:l(()=>[t(g,{modelValue:a.service.requirements,"onUpdate:modelValue":e[10]||(e[10]=r=>a.service.requirements=r),type:"textarea",rows:3,placeholder:"请详细描述服务要求"},null,8,["modelValue"])]),_:1})])):y("",!0)]),u("div",he,[e[27]||(e[27]=u("h3",null,"交付信息",-1)),t(n,{label:"预计交付日期",prop:"deliveryDate"},{default:l(()=>[t(ne,{modelValue:a.deliveryDate,"onUpdate:modelValue":e[11]||(e[11]=r=>a.deliveryDate=r),type:"date",placeholder:"选择日期","disabled-date":le,style:{width:"100%"}},null,8,["modelValue"])]),_:1}),t(n,{label:"备注说明",prop:"remarks"},{default:l(()=>[t(g,{modelValue:a.remarks,"onUpdate:modelValue":e[12]||(e[12]=r=>a.remarks=r),type:"textarea",rows:3,placeholder:"请输入备注说明"},null,8,["modelValue"])]),_:1})]),u("div",De,[t(de,{column:1,border:""},{default:l(()=>[t(se,{label:"订单总额"},{default:l(()=>[u("span",Oe,"¥ "+q(te()),1)]),_:1})]),_:1})]),u("div",Se,[t(b,{type:"primary",onClick:ae,loading:C.value},{default:l(()=>e[28]||(e[28]=[m(" 提交订单 ")])),_:1},8,["loading"]),t(b,{onClick:P,loading:T.value},{default:l(()=>e[29]||(e[29]=[m(" 保存草稿 ")])),_:1},8,["loading"]),t(b,{onClick:$,disabled:C.value||T.value},{default:l(()=>e[30]||(e[30]=[m(" 重置 ")])),_:1},8,["disabled"])])]),_:1},8,["model"])]),_:1})])}}},Fe=me(Be,[["__scopeId","data-v-0280ae6c"]]);export{Fe as default};
