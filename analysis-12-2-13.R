d=read.csv("~/Dropbox/Experiments/exactly/dice-js/Submiterator/dice-pilot-12-1-13.results-parsed.csv", header=T)

levels(d$language)
d = subset(d, language != "spanish")
length(levels(factor(d$workerid))) # 99

# d$attentionCheckPassed = T
# for (i in 1:length(d$rt)) {
	# if (d[i,]$attentionCheck == 'Yes') {
		# if (d[i,]$requestedValue != d[i,]$response) {
			# d[i,]$attentionCheckPassed = F
		# }
	# }
# }

# remove workerid 'A2VWG0L5JHOBWN', who failed both attention checks

d = subset(d, workerid != 'A2VWG0L5JHOBWN')
d = subset(d, attentionCheck == 'No')

# plot(density(log(rt))) 

numeral = function(t) {
	if (t == 'four') return(4)
	if (t == 'five') return(5)
	if (t == 'six') return(6)
	if (t == 'seven') return(7)
	if (t == 'eight') return(8)
}

d$relevantNum = NA
for (i in 1:length(d$rt)) {
	if (d[i,]$qcolor == 'red') {
		d[i,]$relevantNum = d[i,]$numRed
	} else {
		d[i,]$relevantNum = d[i,]$numBlack
	}
}

g = function(r) {
	linguistic = numeral(r[16])
	seen = r[23]
	if (seen < linguistic) return("less")
	if (linguistic == seen) return("equal")
	if (seen > linguistic) return("more")
}
d$qual.condition = NA
for (i in 1:length(d$rt)) d[i,]$qual.condition = g(d[i,])

filt = aggregate(d$response, list(context=d$context, quantifier=d$quantifier, qual.condition=d$qual.condition), FUN=mean)
tapply(filt$x, list(filt$context, filt$quantifier, filt$qual.condition), identity)

filt.sd = aggregate(d$response, list(context=d$context, quantifier=d$quantifier, qual.condition=d$qual.condition), FUN=sd)
tapply(filt.sd$x, list(filt$context, filt$quantifier, filt$qual.condition), identity)

