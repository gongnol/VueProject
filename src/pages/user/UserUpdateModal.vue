<template>
  <a-modal
    :visible=visible
    title='修改用户信息'
    okText='确定'
    cancelText='取消'
    @ok="()=>handleUpdate()"
    @cancel="()=>handleCancel()"
    width='800px'
  >
    <a-form layout='horizontal' @submit="updateUser" ref="myForm" :autoFormCreate="(form)=>{this.form = form}">
      <a-row>
        <a-col :md="12">
          <a-form-item label='用户登录名' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"

                       fieldDecoratorId="loginName"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入用户登录名' ,whitespace: true}]
                       ,initialValue:sysUser.loginName}"
          >

            <a-input disabled="true"/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='中文名' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="userName"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入用户中文名' ,whitespace: true}]
                       ,initialValue:sysUser.userName}"
          >

            <a-input/>

          </a-form-item>
        </a-col>

        <a-col :md="12">
          <a-form-item label='用户类型' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="userType"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请选择用户类型' }],initialValue:sysUser.userType+''}"
          >

            <a-select>
              <a-select-option v-for="(userType, index) in userTypes" :key="index" :value="userType.itemCode">
                {{userType.itemName}}
              </a-select-option>
            </a-select>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='所属业务伙伴' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="partnerId"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入所属业务伙伴' ,whitespace: true}]
                       ,initialValue:sysUser.partnerId+''}"
          >

            <a-input/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='所属组织' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="orgCode"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入所属组织' ,whitespace: true}]
                       ,initialValue:sysUser.orgCode}"
          >

            <a-input/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='状态' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="status"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请选择状态' }],initialValue:sysUser.status+''}"
          >

            <a-select>
              <a-select-option v-for="(userStatus, index) in userStatusList" :key="index" :value="userStatus.itemCode">
                {{userStatus.itemName}}
              </a-select-option>
            </a-select>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='手机号' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="mp"
                       :fieldDecoratorOptions="{rules: [{ validator:this.handleValidateMp }],initialValue:sysUser.mp}"

          >

            <a-input/>

          </a-form-item>

        </a-col>

      </a-row>
      <a-row>
        <a-col style="textAlign: right" :md="24">
          <a style="font-size: 14px;margin-right: 50px;" @click="toggleShowUpdatePwd">
          修改密码 <a-icon :type="pwdShow?'up':'down'" />
          </a>
        </a-col>

        <a-col :md="12" v-if="pwdShow">
          <a-form-item label='密码' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="pwd"
                       :fieldDecoratorOptions="{rules: [{ required: pwdShow, message: '请输入密码' ,whitespace: true}]}"
          >
            <a-input type="password"/>

          </a-form-item>
        </a-col>
        <a-col :md="12" v-if="pwdShow">
          <a-form-item label='确认密码' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="confirmPwd"
                       :fieldDecoratorOptions="{rules: [{ required: pwdShow, message: '请输入确认密码' ,whitespace: true}, {required: pwdShow,validator:this.validateConfirmPassword }]}"
          >

            <a-input type="password"/>

          </a-form-item>

        </a-col>
      </a-row>
      </a-row>
    </a-form>

  </a-modal>
</template>
<script>
  import {Form} from 'ant-design-vue'
  import {request} from "../../utils/RestClient";
  import moment from 'moment';
  import * as userService from "./UserService";
  import * as sysCodeService from "../syscode/SysCodeService";
  import * as commonUtil from "../../utils/common_util";


  export default {
    name: "UserAdd",
    props: ['updateOkCallback'],
    data () {
      return {
        visible: false,
        userTypes: [],
        userStatusList: [],
        formItemLayout: {
          labelCol: {span: 6},
          wrapperCol: {span: 14},
        },
        inputLoginName: "",
        loginNameValidateStatus: "",
        sysUser: {},
        pwdShow: false
      }
    },
    mounted() {
      this.loadUserTypes();
      this.loadUserStatus();
    },
    methods: {
      showModal (sysUser) {
        this.visible = true;
        //this.sysUser = commonUtil.copyReqObj(sysUser);
        this.sysUser = sysUser;
        this.pwdShow = false;
      },
      handleCancel  () {
        this.visible = false;
        const form = this.form;
        form.resetFields();
      },

      loadUserTypes () {
        sysCodeService.findSysUserTypes()
          .then(res => {
            if (res.status === 0) {
              let ret = res.data;
              this.userTypes = ret;
            } else {
              this.$message.error("获取用户类型(s)错误");
            }
          })
          .catch(err => {
            this.$message.error("获取用户类型(s)错误");
            console.log(`err is ${err}`);
          });

      },
      loadUserStatus () {

        sysCodeService.findSysUserStatus()
          .then(res => {
            //debugger;
            if (res.status === 0) {
              let ret = res.data;
              this.userStatusList = ret;
            } else {
              this.$message.error("获取用户类型(s)错误");
            }
          })
          .catch(err => {
            this.$message.error("获取用户类型(s)错误");
            console.log(`err is ${err}`);
          });

      },
      //调用form的submit方法
      handleUpdate(){
        this.$refs.myForm.onSubmit();
        //this.userTypes;
        //debugger
      },
      //修改用户信息
      updateUser  () {
          //debugger;
        const form = this.form;


        form.validateFields((err, values) => {
          if (err) {
            return;
          }

          console.log('Received values of form: ', values);


          let updateUserObj = commonUtil.copyReqObj(values);
          updateUserObj.id=this.sysUser.id;

          if(!this.pwdShow){
            delete updateUserObj.pwd;
            delete updateUserObj.confirmPwd;
          }

          userService.updateUser(updateUserObj).then(resp=>{

              if(resp.status===0){
                this.$message.success("修改成功");
                this.visible = false
                form.resetFields();
                this.$emit('updateCallback');
              }else{
                this.$message.error("修改失败");
              }
          }).catch(err=>{
            console.log(`err is ${err}`);
          })

        })
      },

      validateConfirmPassword (rule, value, callback) {
        //debugger;
        const {getFieldValue} = this.form;

        if (value && value !== getFieldValue('pwd')) {
          callback('两次密码输入不一致！')
        }

        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
        callback()
      },

      handleValidateMp(rule, value, callback){
        if (value && !commonUtil.isMobile(value)) {
          callback('请输入正确的手机号');
        }
        callback();
      },
      //切换修改密码页面
      toggleShowUpdatePwd(){
        this.pwdShow=!this.pwdShow;
      }
    },


    render () {
      console.log('UserAdd in, this.visible is ', this.visible)

    },
  }
</script>
