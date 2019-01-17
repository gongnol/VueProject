<script>
import { Form } from 'ant-design-vue'
import { request } from "../../utils/RestClient";
import moment from 'moment';
import * as sysCodervice from "./SysCodeService";

const CollectionCreateForm = Form.create()(
  {
    props: ['visible','isTrees','maintainTypes'],
    render () {
      const { visible, form,isTrees,maintainTypes} = this
      const { getFieldDecorator } = form
      console.log('SysCodeAdd CollectionCreateForm in, visible is ', visible)
      return (
        <a-modal
          visible={visible}
          title='新增码表类型'
          okText='创建'
          cancelText='取消'
          onCancel={() => { this.$emit('cancel') }}
          onOk={() => { this.$emit('create') }}
        >
          <a-form layout='vertical'>
            <a-form-item label='类型编码'>
              {getFieldDecorator('typeCode', {
                rules: [{ required: true, message: '请输入类型编码' }],
              })(
                <a-input />
              )}
            </a-form-item>
            <a-form-item label='类型名称'>
              {getFieldDecorator('typeName', {
                rules: [{ required: true, message: '请输入类型名称' }],
              })(
                <a-input />
              )}
              </a-form-item>

              <a-form-item label='是否树状结构'>
                {getFieldDecorator('isTree', {
                  rules: [{ required: true, message: '请选择是否树状结构' }],
                })(
                      <a-select  >
                      {
                        isTrees && isTrees.map((item) =>{ 
                          return <a-select-option value={item.itemCode} key={item.itemCode}>{item.itemName}</a-select-option>;
                        })
                     }
                   </a-select>
                )}
              </a-form-item>

             <a-form-item label='维护方式'>
                {getFieldDecorator('maintainType', {
                  rules: [{ required: true, message: '请选择维护方式' }],
                })(
                      <a-select  >
                      {
                        maintainTypes && maintainTypes.map((item) =>{ 
                          return <a-select-option value={item.itemCode} key={item.itemCode}>{item.itemName}</a-select-option>;
                        })
                     }
                   </a-select>
                )}
              </a-form-item>

          </a-form>
        </a-modal>
      )
    },
  }
)
 
const isTrees = []
const maintainTypes = []

export default {
  name: "SysTypeAddModal",
  props: ['addOkCallback'],
  data () {
    return {
        visible: false,
        loading :false,
        maintainTypes:maintainTypes,
        isTrees:isTrees,
     }
  },
  mounted() {
    console.log("SysTypeAddModal mounted");
  },
  methods: {
     showModal () {
      this.queryIsTrees()
      this.queryMaintainTypes()
      this.visible = true;
     },
    handleCancel  () {
      this.visible = false
    },
    queryIsTrees(){
      let self = this
      self.loading = true;
       sysCodervice.getItemsBytypeCode("COMM_BOOLEAN")
      .then(res => {
        self.loading = false;
        if (res.status === 0) {
          self.isTrees = res.data;
          console.log(res.data)
        } else {
          this.$message.error("获取数据错误");
        }
      })
      .catch(err => {
        self.loading = false;
        this.$message.error("获取数据错误");
        console.log(`err is ${err}`);
      });
    },
    queryMaintainTypes(){
      let self = this
      self.loading = true;
       sysCodervice.getItemsBytypeCode("MAINTAIN_TYPE")
      .then(res => {
        self.loading = false;
        if (res.status === 0) {
          self.maintainTypes = res.data;
          console.log(res.data)
        } else {
          this.$message.error("获取数据错误");
        }
      })
      .catch(err => {
        self.loading = false;
        this.$message.error("获取数据错误");
        console.log(`err is ${err}`);
      });
    },
    handleCreate  () {
      const form = this.formRef.form
      form.validateFields((err, values) => {
        if (err) {
          return
        }
        console.log('Received values of form: ', values)
        let row = {
          typeCode: values.typeCode,
          typeName: values.typeName,
          isTree:values.isTree,
          maintainType:values.maintainType
        }
        let self = this;
        sysCodervice.addSysType(row)
        .then(res => {
          self.loading = false;
          if (res.status === 0) {
            self.$message.success("创建码表类型成功");
            self.visible = false
            form.resetFields()
             if (self.addOkCallback && typeof self.addOkCallback === 'function') {
               self.addOkCallback()
            }
          } else {
            self.$message.error("创建码表类型错误");
          }
        })
        .catch(err => {
         self.loading = false;
          self.$message.error("创建码表类型错误");
          console.log(`err is ${err}`);
        });
      })
    },
    saveFormRef  (formRef) {
      this.formRef = formRef
    },
  },

  render () {
    console.log('SysTypeAdd Add in, this.visible is ', this.visible)
    return (
      <span>
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.visible}
          maintainTypes={this.maintainTypes}
          isTrees = {this.isTrees}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </span>
    )
  },
}
</script>
