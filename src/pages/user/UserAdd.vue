<template>
  <a-modal
    :visible=visible
    title='新增用户'
    okText='创建'
    cancelText='取消'
    @ok="()=>handleCreate()"
    @cancel="()=>handleCancel()"

    width='800px'
  >
    <a-form layout='horizontal' @submit="createUser" ref="myForm" :autoFormCreate="(form)=>{this.form = form}">
      <a-row>
        <a-col :md="12">
          <a-form-item label='用户登录名' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       hasFeedback
                       :validateStatus="loginNameValidateStatus"
                       fieldDecoratorId="loginName"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入用户登录名' ,whitespace: true}]}"
          >

            <a-input-search  v-model="inputLoginName" @search="checkLoginName()"/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='中文名' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="userName"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入用户中文名' ,whitespace: true}
                       ]}"
          >

            <a-input/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='密码' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
            fieldDecoratorId="pwd"
            :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入密码' ,whitespace: true}]}"
          >
            <a-input type="password"/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='确认密码' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="confirmPwd"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入确认密码' ,whitespace: true},{ required: true, validator:this.validateConfirmPassword}]}"
          >

            <a-input type="password"/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='用户类型' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="userType"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请选择用户类型' }]}"
          >

            <a-select>
              <a-select-option v-for="(userType, index ) in userTypes" :key="index" :value="userType.itemCode">{{userType.itemName}}</a-select-option>
            </a-select>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='所属业务伙伴' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="partnerId"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入所属业务伙伴' ,whitespace: true}]}"
          >

            <a-input/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='所属组织' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="orgCode"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请输入所属组织' ,whitespace: true}]}"
          >

            <a-input/>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='状态' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="status"
                       :fieldDecoratorOptions="{rules: [{ required: true, message: '请选择状态' }]}"
          >

            <a-select>
              <a-select-option v-for="(userStatus, index) in userStatusList" :key="index" :value="userStatus.itemCode">{{userStatus.itemName}}</a-select-option>
            </a-select>

          </a-form-item>
        </a-col>
        <a-col :md="12">
          <a-form-item label='手机号' :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
                       fieldDecoratorId="mp"
                       :fieldDecoratorOptions="{rules: [{ validator:this.handleValidateMp }]}"

          >

            <a-input/>

          </a-form-item>

        </a-col>
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
        loginNameValidateStatus: ""
      }
    },
    mounted() {
      this.loadUserTypes();
      this.loadUserStatus();
    },
    methods: {
      showModal () {
        this.visible = true
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
      handleCreate(){
        this.$refs.myForm.onSubmit();
      },
      //创建用户
      createUser  () {
        const form = this.form;
        form.validateFields((err, values) => {
          if (err) {
            return;
          }
          console.log('Received values of form: ', values);


          let addUserObj = commonUtil.copyReqObj(values);
          debugger;

          userService.existLoginName(addUserObj.loginName)
            .then(resp => {
              debugger;
              if (resp.status === 0 && !resp.data) {
                let self = this;

                userService.addUser(addUserObj)
                  .then(res => {
                    self.loading = false;

                    if (res.status === 0) {
                      this.$message.success("创建用户成功");
                      self.visible = false;
                      form.resetFields();
                      this.$emit('addOkCallback');
                    } else {
                      this.$message.error("创建用户错误");
                    }
                  })
              } else {
                //设置loginName错误信息
                form.setFields({
                  'loginName': {
                    value: values.loginName,
                    errors: [new Error('用户登录名已存在')],
                  },
                });
              }

            }).catch(err => {
            console.info(`err is ${err}`);
          });


        })
      },

      validateConfirmPassword (rule, value, callback) {
        //debugger;
        const {getFieldValue} = this.formRef.form;

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

      checkLoginName(){
        this.form.validateFields(['loginName'],(errs, values)=>{
            this.loginNameValidateStatus="";
            if(errs){
                return;
            }
            let loginName = values.loginName.trim();
          userService.existLoginName(loginName)
            .then(resp => {
              debugger;
              if (resp.status === 0 && !resp.data) {
                this.loginNameValidateStatus="success";
              } else {
                //设置loginName错误信息
                this.form.setFields({
                  'loginName': {
                    value: loginName,
                    errors: [new Error('用户登录名已存在')],
                  },
                });
              }

            }).catch(err => {
            console.info(`err is ${err}`);
          });
        })



      }

    },


    render () {
      console.log('UserAdd in, this.visible is ', this.visible)

    },
  }
</script>
