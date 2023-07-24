import{i as e}from"./index.481b1b11.js";const l=/^[^\u4e00-\u9fa5]/,o=/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{6,15}$/,a=6,u=15,t={passwordReg:/^[^\u4e00-\u9fa5]/,min:6,max:15,phone(s,r,n){if(/^[1][3,4,5,7,8][0-9]{9}$/.test(r))n();else return n(new Error(e.global.t("phoneRule")))},unphone(s,r,n){const g=/^[1][3,4,5,7,8][0-9]{9}$/;if(r==="")n();else if(g.test(r))n();else return n(new Error(e.global.t("phoneRule")))},password(s,r,n){if(r==null||r==null||r=="")return n(new Error(e.global.t("noPasswordRule")));if(l.test(r)){if(r.length<a||r.length>u)return n(new Error(e.global.t("passwordRule")));n()}else return n(new Error(e.global.t("zhPasswordRule")))},unPassword(s,r,n){if(r==null||r==null||r=="")return n(e.global.t("noPasswordRule"));if(r.length<5)return n(new Error(e.global.t("lessPasswordRule")));n()}},m=[{required:!0,message:e.global.t("requiredRule"),trigger:["blur","change"]}],d=[{required:!0,message:e.global.t("accountRule"),trigger:["blur","change"]},{min:4,max:20,message:e.global.t("accountLenthRule"),trigger:["blur","change"]}];e.global.t("unAccountLength");const h=[{required:!0,message:e.global.t("nameRule"),trigger:["blur","change"]},{min:2,max:15,message:e.global.t("nameLength"),trigger:["blur","change"]}],b=[{min:2,max:15,message:e.global.t("nameLength"),trigger:["blur","change"]}];e.global.t("phoneRequired"),t.phone;const R=[{validator:t.unphone,trigger:["blur","change"]}],p=[{type:"email",message:e.global.t("emailRule"),trigger:["blur","change"]}],w=[{required:!0,validator:t.password,trigger:"blur"},{pattern:o,message:e.global.t("passwordRule"),trigger:["blur","change"]}];export{d as a,R as b,p as e,h as n,w as p,m as r,b as u};
