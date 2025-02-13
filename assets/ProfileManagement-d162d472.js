import{_ as L,r as T,a as N,o as E,b as F,c as r,d as C,e as $,f as s,w as n,g as u,h as G,i as m,j as J,k as j,E as p,l as O}from"./index-bbf05c48.js";const z={class:"profile-management"},Q={class:"card-header"},X={class:"form-section"},A={class:"form-section"},H={class:"form-section"},K={class:"form-actions"},W={__name:"ProfileManagement",setup(Y){const f=T(null),d=N({isDraft:!1,isSaving:!1,lastSaved:null}),l=N({personalInfo:{name:"",gender:"",phone:"",email:"",idNumber:"",emergencyContact:{name:"",phone:""}},businessInfo:{licenseNumber:"",companyName:"",legalRepresentative:"",registeredCapital:0,operatingStatus:"",address:"",businessScope:""},documents:{businessLicense:[],qualifications:[]}}),q={"personalInfo.name":[{required:!0,message:"请输入姓名",trigger:"blur"},{min:2,max:50,message:"长度在2到50个字符之间",trigger:"blur"}],"personalInfo.gender":[{required:!0,message:"请选择性别",trigger:"change"}],"personalInfo.phone":[{required:!0,message:"请输入联系电话",trigger:"blur"},{pattern:/^1[3-9]\d{9}$/,message:"请输入正确的手机号码",trigger:"blur"}],"personalInfo.email":[{required:!0,message:"请输入电子邮箱",trigger:"blur"},{type:"email",message:"请输入正确的邮箱格式",trigger:"blur"}],"personalInfo.idNumber":[{required:!0,message:"请输入身份证号",trigger:"blur"},{pattern:/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,message:"请输入正确的身份证号",trigger:"blur"}],"personalInfo.emergencyContact.name":[{required:!0,message:"请输入紧急联系人姓名",trigger:"blur"}],"personalInfo.emergencyContact.phone":[{required:!0,message:"请输入紧急联系人电话",trigger:"blur"},{pattern:/^1[3-9]\d{9}$/,message:"请输入正确的手机号码",trigger:"blur"}],"businessInfo.licenseNumber":[{required:!0,message:"请输入营业执照号",trigger:"blur"}],"businessInfo.companyName":[{required:!0,message:"请输入企业名称",trigger:"blur"}],"businessInfo.legalRepresentative":[{required:!0,message:"请输入法定代表人姓名",trigger:"blur"}],"businessInfo.registeredCapital":[{required:!0,message:"请输入注册资本",trigger:"blur"},{type:"number",min:0,message:"注册资本必须大于0",trigger:"blur"}],"businessInfo.operatingStatus":[{required:!0,message:"请选择经营状态",trigger:"change"}],"businessInfo.address":[{required:!0,message:"请输入企业地址",trigger:"blur"}],"businessInfo.businessScope":[{required:!0,message:"请输入经营范围",trigger:"blur"},{max:500,message:"经营范围不能超过500个字符",trigger:"blur"}]};let b=null;const _=t=>{const e=["image/jpeg","image/png","application/pdf"].includes(t.type),c=t.size/1024/1024<10;return e?c?!0:(p.error("文件大小不能超过10MB！"),!1):(p.error("只能上传JPG/PNG/PDF格式的文件！"),!1)},w=(t,e)=>{l.documents.businessLicense=[e],p.success("营业执照上传成功")},x=(t,e)=>{l.documents.qualifications.push(e),p.success("资质证书上传成功")},V=()=>{p.error("文件上传失败，请重试")},v=async()=>{if(f.value)try{await f.value.validate(),d.isSaving=!0,await new Promise(t=>setTimeout(t,1e3)),d.lastSaved=new Date,d.isDraft=!1,p.success("保存成功")}catch{p.error("表单验证失败，请检查填写的内容")}finally{d.isSaving=!1}},U=()=>{O.confirm("确定要重置表单吗？所有未保存的内容将丢失。","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{var t;(t=f.value)==null||t.resetFields(),p.success("表单已重置")})},D=()=>{d.isDraft=!0,d.lastSaved=new Date,localStorage.setItem("profileDraft",JSON.stringify(l))};return E(()=>{b=setInterval(D,6e4);const t=localStorage.getItem("profileDraft");t&&(Object.assign(l,JSON.parse(t)),d.isDraft=!0)}),F(()=>{b&&clearInterval(b)}),(t,e)=>{const c=r("el-tag"),i=r("el-input"),a=r("el-form-item"),y=r("el-radio"),B=r("el-radio-group"),M=r("el-input-number"),I=r("el-option"),P=r("el-select"),g=r("el-button"),S=r("el-upload"),k=r("el-form"),R=r("el-card");return C(),$("div",z,[s(R,{class:"profile-card"},{header:n(()=>[u("div",Q,[e[15]||(e[15]=u("h2",null,"资料管理",-1)),d.isDraft?(C(),G(c,{key:0,type:"info"},{default:n(()=>e[14]||(e[14]=[m("草稿已保存")])),_:1})):J("",!0)])]),default:n(()=>[s(k,{ref_key:"formRef",ref:f,model:l,rules:q,"label-width":"120px",onSubmit:j(v,["prevent"]),"status-icon":""},{default:n(()=>[u("div",X,[e[18]||(e[18]=u("h3",null,"个人信息",-1)),s(a,{label:"姓名",prop:"personalInfo.name"},{default:n(()=>[s(i,{modelValue:l.personalInfo.name,"onUpdate:modelValue":e[0]||(e[0]=o=>l.personalInfo.name=o),maxlength:"50","show-word-limit":""},null,8,["modelValue"])]),_:1}),s(a,{label:"性别",prop:"personalInfo.gender"},{default:n(()=>[s(B,{modelValue:l.personalInfo.gender,"onUpdate:modelValue":e[1]||(e[1]=o=>l.personalInfo.gender=o)},{default:n(()=>[s(y,{label:"male"},{default:n(()=>e[16]||(e[16]=[m("男")])),_:1}),s(y,{label:"female"},{default:n(()=>e[17]||(e[17]=[m("女")])),_:1})]),_:1},8,["modelValue"])]),_:1}),s(a,{label:"联系电话",prop:"personalInfo.phone"},{default:n(()=>[s(i,{modelValue:l.personalInfo.phone,"onUpdate:modelValue":e[2]||(e[2]=o=>l.personalInfo.phone=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"电子邮箱",prop:"personalInfo.email"},{default:n(()=>[s(i,{modelValue:l.personalInfo.email,"onUpdate:modelValue":e[3]||(e[3]=o=>l.personalInfo.email=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"身份证号",prop:"personalInfo.idNumber"},{default:n(()=>[s(i,{modelValue:l.personalInfo.idNumber,"onUpdate:modelValue":e[4]||(e[4]=o=>l.personalInfo.idNumber=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"紧急联系人",prop:"personalInfo.emergencyContact.name"},{default:n(()=>[s(i,{modelValue:l.personalInfo.emergencyContact.name,"onUpdate:modelValue":e[5]||(e[5]=o=>l.personalInfo.emergencyContact.name=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"紧急联系电话",prop:"personalInfo.emergencyContact.phone"},{default:n(()=>[s(i,{modelValue:l.personalInfo.emergencyContact.phone,"onUpdate:modelValue":e[6]||(e[6]=o=>l.personalInfo.emergencyContact.phone=o)},null,8,["modelValue"])]),_:1})]),u("div",A,[e[19]||(e[19]=u("h3",null,"企业信息",-1)),s(a,{label:"营业执照号",prop:"businessInfo.licenseNumber"},{default:n(()=>[s(i,{modelValue:l.businessInfo.licenseNumber,"onUpdate:modelValue":e[7]||(e[7]=o=>l.businessInfo.licenseNumber=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"企业名称",prop:"businessInfo.companyName"},{default:n(()=>[s(i,{modelValue:l.businessInfo.companyName,"onUpdate:modelValue":e[8]||(e[8]=o=>l.businessInfo.companyName=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"法定代表人",prop:"businessInfo.legalRepresentative"},{default:n(()=>[s(i,{modelValue:l.businessInfo.legalRepresentative,"onUpdate:modelValue":e[9]||(e[9]=o=>l.businessInfo.legalRepresentative=o)},null,8,["modelValue"])]),_:1}),s(a,{label:"注册资本",prop:"businessInfo.registeredCapital"},{default:n(()=>[s(M,{modelValue:l.businessInfo.registeredCapital,"onUpdate:modelValue":e[10]||(e[10]=o=>l.businessInfo.registeredCapital=o),min:0,precision:2,step:1e3,style:{width:"100%"}},null,8,["modelValue"])]),_:1}),s(a,{label:"经营状态",prop:"businessInfo.operatingStatus"},{default:n(()=>[s(P,{modelValue:l.businessInfo.operatingStatus,"onUpdate:modelValue":e[11]||(e[11]=o=>l.businessInfo.operatingStatus=o),style:{width:"100%"}},{default:n(()=>[s(I,{label:"正常经营",value:"operating"}),s(I,{label:"筹备中",value:"preparing"}),s(I,{label:"停业",value:"suspended"})]),_:1},8,["modelValue"])]),_:1}),s(a,{label:"企业地址",prop:"businessInfo.address"},{default:n(()=>[s(i,{modelValue:l.businessInfo.address,"onUpdate:modelValue":e[12]||(e[12]=o=>l.businessInfo.address=o),type:"textarea"},null,8,["modelValue"])]),_:1}),s(a,{label:"经营范围",prop:"businessInfo.businessScope"},{default:n(()=>[s(i,{modelValue:l.businessInfo.businessScope,"onUpdate:modelValue":e[13]||(e[13]=o=>l.businessInfo.businessScope=o),type:"textarea",maxlength:"500","show-word-limit":"",rows:4},null,8,["modelValue"])]),_:1})]),u("div",H,[e[24]||(e[24]=u("h3",null,"资质文件",-1)),s(a,{label:"营业执照",prop:"documents.businessLicense"},{default:n(()=>[s(S,{class:"upload-container",action:"/api/upload","before-upload":_,"on-success":w,"on-error":V,"file-list":l.documents.businessLicense,limit:1},{tip:n(()=>e[21]||(e[21]=[u("div",{class:"el-upload__tip"}," 请上传PDF、JPG或PNG格式文件，大小不超过10MB ",-1)])),default:n(()=>[s(g,{type:"primary"},{default:n(()=>e[20]||(e[20]=[m("上传营业执照")])),_:1})]),_:1},8,["file-list"])]),_:1}),s(a,{label:"资质证书",prop:"documents.qualifications"},{default:n(()=>[s(S,{class:"upload-container",action:"/api/upload","before-upload":_,"on-success":x,"on-error":V,"file-list":l.documents.qualifications,limit:5,multiple:""},{tip:n(()=>e[23]||(e[23]=[u("div",{class:"el-upload__tip"}," 最多上传5个文件，每个文件不超过10MB ",-1)])),default:n(()=>[s(g,{type:"primary"},{default:n(()=>e[22]||(e[22]=[m("上传资质证书")])),_:1})]),_:1},8,["file-list"])]),_:1})]),u("div",K,[s(g,{type:"primary",onClick:v,loading:d.isSaving},{default:n(()=>e[25]||(e[25]=[m(" 保存 ")])),_:1},8,["loading"]),s(g,{onClick:U,disabled:d.isSaving},{default:n(()=>e[26]||(e[26]=[m(" 重置 ")])),_:1},8,["disabled"])])]),_:1},8,["model"])]),_:1})])}}},h=L(W,[["__scopeId","data-v-0e933443"]]);export{h as default};
