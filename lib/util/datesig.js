////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Datesignature utility class. 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class date_signature
{
	constructor(firstName, lastName) {
		this.date = {};
		
		this.date.iso = (new Date(Date.now())).toISOString();
		
		this.date.year = this.date.iso.slice(0, 4);
		this.date.month = this.date.iso.slice(5, 7);
		this.date.day = this.date.iso.slice(8, 10);
		
		this.date.y = this.date.year;
		this.date.m = this.date.month;
		this.date.d = this.date.day;
	}
}

exports.main = date_signature;