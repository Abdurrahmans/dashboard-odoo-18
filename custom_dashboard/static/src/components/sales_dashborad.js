/** @odoo-module */

import { registry } from "@web/core/registry"
import { KpiCard } from "./kpi_card/kpi_card"
import { ChartRenderer } from "./chart_renderer/chart_renderer"
import { Component,useState,useRef,onWillStart,onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { loadJS } from "@web/core/assets"
import { getColor} from "@web/core/colors/colors";

export class OwlSalesDashboard extends Component {

	//Top Products
	async getTopProduct(){
	 let domain =[['state', 'in',['sent','draft']]]
	 if(this.state.period>0){
		domain.push(['date', '>', this.state.current_date])
	}
	const data = await this.orm.readGroup('sale.report',domain,['product_id','price_total'],['product_id'],{limit:5,orderby:'price_total desc'})

    this.state.topProducts={
	  data: {
		labels: data.map(d=> d.product_id[1]),
		  datasets: [
		  {
			label: 'Total',
			data: data.map(d=> d.price_total),
			hoverOffset: 4,
			backgroundColor:data.map((_,index)=> getColor(index)),
		  },{
			label: 'Count',
			data: data.map(d=> d.product_id_count),
			hoverOffset: 4,
			backgroundColor:data.map((_,index)=> getColor(index)),
		}]
	 },
	 domain,
	 label_field:'product_id',
	 }
	}
	//Top Sales People
	async getTopSalePeople(){
		 let domain =[['state', 'in',['sale','done']]]
		 if(this.state.period>0){
			domain.push(['date', '>', this.state.current_date])
		}
		const data = await this.orm.readGroup('sale.report',domain,['user_id','price_total'],['user_id'],{limit:5,orderby:'price_total desc'})
		this.state.topSalePeoples={
		  data: {
			labels: data.map(d=> d.user_id[1]),
			  datasets: [
			  {
				label: 'Total',
				data: data.map(d=> d.price_total),
				hoverOffset: 4,
				backgroundColor:data.map((_,index)=> getColor(index)),
			  }]
		 },
		 domain,
		 label_field:'user_id',
	 }
	}

	//Monthly Sales
	async getMonthlySale(){
	  let domain =[['state', 'in',['sent','draft','sale','done']]]
	 if(this.state.period>0){
		domain.push(['date', '>', this.state.current_date])
	}
	const data = await this.orm.readGroup('sale.report',domain,['date','state','price_total'],['date','state'],{orderby:'date',lazy:false})
	console.log(data)
    this.state.monthlySales={
	  data: {
		  labels: [... new Set(data.map(d=> d.date))],
		  datasets: [
		  {
			label: 'Quotations',
			data: data.filter(d => d.state == 'draft' || d.state == 'sent').map(d=> d.price_total),
			hoverOffset: 4,
			backgroundColor:'red',
		  },{
			label: 'Orders',
			data: data.filter( d=> ['sale','done'].includes(d.state)).map(d => d.price_total),
			hoverOffset: 4,
			backgroundColor:'green',
	}]
	 },
	 	 domain,
		 label_field:'date',
	 }
	}

//	  data: {
//		  labels: [... new Set(data.map(d=> d.date))],
//		  const quotations =  data.filter(d => d.state == 'draft' || d.state == 'sent')
//		  const orders = data.filter(d=>['sale','done'].includes(d.state))
//
//		  datasets: [
//		  {
//			label: 'Quotations',
//			data: labels.map(l=> l.quotations.filter(q=>l==q.date).map(j=>j.price_total).reduce((a,c)=>a+c,0)),
//			hoverOffset: 4,
//			backgroundColor:'red',
//		  },{
//			label: 'Orders',
//			data: labels.map(l=> l.orders.filter(q=>l== q.date).map(j=>j.price_total).reduce((a,c)=>a+c,0)),
//			hoverOffset: 4,
//			backgroundColor:'green',
//	}]
//	 },
	//Partner Orders
    async getPartnerOrders(){

	 let domain =[['state', 'in',['sent','draft','sale','done']]]
	 if(this.state.period>0){
		domain.push(['date', '>', this.state.current_date])
	}
	const data = await this.orm.readGroup('sale.report',domain,['partner_id','price_total','product_uom_qty'],
	['partner_id'],{orderby:"partner_id",lazy:false})
	console.log(data)
    this.state.partnerOrders={
	  data: {
		  labels: data.map(d => d.partner_id[1]),
		   datasets: [
		  {
			label: 'Total Amounts',
			data: data.map(d=> d.price_total),
			hoverOffset: 4,
			backgroundColor:'orange',
			yAxisID:"Total",
			order:1,
		  },{
			label: 'Orders Qty',
			data: data.map(d=> d.product_uom_qty),
			hoverOffset: 4,
			backgroundColor:'blue',
			type:'line',
			borderColor:'blue',
			yAxisID:"Qty",
			order:0,
	}]
	 },
	 scales:{
		Qty:{
		position:'right',
		}

	 },
	 	 domain,
		 label_field:'partner_id',

	 }
	}


    setup(){
    this.state =useState ({
    quotations:{
		value:10,
		percentage:6
    },
    period:90,
    })

    this.orm = useService("orm")
    this.actionService = useService("action")
    onWillStart(async()=>{

	     await loadJS("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js")
		 this.getDates()
		 await this.getQuotation()
		 await this.getOrders()

		 await this.getTopProduct()
		 await this.getTopSalePeople()
		 await this.getMonthlySale()
		 await this.getPartnerOrders()

    })
    }
  async onChangePeriod(){
    this.getDates()
    await this.getQuotation()
    await this.getOrders()
    await this.getTopProduct()
	await this.getTopSalePeople()
	await this.getMonthlySale()
	await this.getPartnerOrders()
  }
  getDates(){
      this.state.current_date = moment().subtract(this.state.period, 'days').format('YYYY-MM-DD');
      this.state.previous_date = moment().subtract(this.state.period * 2, 'days').format('YYYY-MM-DD');
  }
  async getQuotation(){
	 let domain =[['state', 'in',['sent','draft']]]
	 if(this.state.period>0){
		domain.push(['date_order', '>', this.state.current_date])
	}
	 const data = await this.orm.searchCount("sale.order",domain)
	 this.state.quotations.value= data


		//previous domain
	let prev_domain =[['state', 'in',['sent','draft']]]
	if(this.state.period>0){
	  prev_domain.push(['date_order','>', this.state.previous_date], ['date_order','<=', this.state.current_date])
	}
	const prev_data = await this.orm.searchCount("sale.order",prev_domain)
	  const percentage = ((data - prev_data)/prev_data) * 100
	  this.state.quotations.percentage = percentage.toFixed(2)


	}

  async getOrders(){
	let domain =[['state', 'in',['sale','done']]]
	if(this.state.period>0){
		domain.push(['date_order', '>', this.state.current_date])
	}
	const data = await this.orm.searchCount("sale.order",domain)
	//	this.state.quotations.value= data


		//previous domain
	let prev_domain =[['state', 'in',['sale','done']]]
	if(this.state.period>0){
	  prev_domain.push(['date_order','>', this.state.previous_date], ['date_order','<=', this.state.current_date])
	}
	const prev_data = await this.orm.searchCount("sale.order",prev_domain)
	 const percentage = ((data - prev_data)/prev_data) * 100

	//revenue
	const current_revenue = await this.orm.readGroup("sale.order",domain,['amount_total:sum'],[])
	const prev_revenue = await this.orm.readGroup("sale.order",prev_domain,['amount_total:sum'],[])
	const revenue_percentage = ((current_revenue[0].amount_total - prev_revenue[0].amount_total)/prev_revenue[0].amount_total) * 100

	//average
	const current_avg = await this.orm.readGroup("sale.order",domain,['amount_total:avg'],[])
	const prev_avg = await this.orm.readGroup("sale.order",prev_domain,['amount_total:avg'],[])
	const avg_percentage = ((current_avg[0].amount_total - prev_avg[0].amount_total)/prev_avg[0].amount_total) * 100

	  this.state.orders={
	   value:data,
	   percentage:percentage.toFixed(2),
	   revenue:`$${(current_revenue[0].amount_total/1000).toFixed(1)}k`,
	   revenue_percentage:revenue_percentage.toFixed(2),
	   average:`$${(current_avg[0].amount_total/1000).toFixed(1)}k`,
	   average_percentage:avg_percentage.toFixed(2)

	  }


	}
  async viewQuotations(){
  	let domain =[['state', 'in',['sent','draft']]]
	if(this.state.period>0){
		domain.push(['date_order', '>', this.state.current_date])
	}
	let list_view = await this.orm.searchRead('ir.model.data',[['name','=','view_quotation_tree_with_onboarding']],['res_id'])
    this.actionService.doAction({
            name: 'Quotations',
            type: "ir.actions.act_window",
            res_model: "sale.order",
            domain,
            views: [
            [list_view.length>0 ? list_view[0].res_id:false, "list"],
            [false, "form"]
            ],
        });
  }

  viewOrders(){
  	let domain =[['state', 'in',['sale','done']]]
	if(this.state.period>0){
		domain.push(['date_order', '>', this.state.current_date])
	}
    this.actionService.doAction({
            name: 'Orders',
            type: "ir.actions.act_window",
            res_model: "sale.order",
            domain,
            context:{group_by:['date_order']},
            views: [
            [false, "list"],
            [false, "form"]
            ],
        });
  }

  viewRevenues(){
  	let domain =[['state', 'in',['sale','done']]]
	if(this.state.period>0){
		domain.push(['date_order', '>', this.state.current_date])
	}
    this.actionService.doAction({
            name: 'Revenues',
            type: "ir.actions.act_window",
            res_model: "sale.order",
            domain,
            context:{group_by:['date_order']},
            views: [
            [false, "pivot"],
            [false, "form"]
            ],
        });
  }
}

OwlSalesDashboard.template = "owl.OwlSalesDashboard"
OwlSalesDashboard.components = { KpiCard,ChartRenderer}

registry.category("actions").add("owl.sales_dashboard", OwlSalesDashboard)