import re

filename = "dice-pilot-12-1-13.results"

numQuestions = 40

fl=open(filename, 'r')
lines = fl.readlines()
fl.close()

processedlines = [line.split('\"\t\"') for line in lines]
processed = [[re.sub('[\n\"{}]', '', x) for x in line] for line in processedlines]
dict = {}

header = ['workerid', 'language', 'initialValue','die0numdots','die0color','die1numdots','die1color','die2numdots','die2color','die3numdots','die3color','numRed','numBlack','context','quantifier','number','qcolor','attentionCheck','requestedValue','rt','response']

def find_idx (string):
    vals = [i for i,x in enumerate(processed[0]) if x == string]
    if len(vals) == 0:
        return -1
    else:
        return vals[0]

trialindices = []
for j in xrange(1, numQuestions + 1):
    trialindices = trialindices + [k for k,x in enumerate(processed[0]) if x == 'Answer.q' + str(j)]

i=1
for subjectdata in processed[1:]:
    language = subjectdata[find_idx('Answer.language')].replace(' ', '')
  #  if language == "":
   #     language = "English"  
# modify for all the weird ways of saying "english" we get          
    subjname = "subject" + str(i)
    dict[subjname] = {}
    i += 1
    for trialindex in trialindices:
        trialdataraw = {}
        keysAndValues = [x.split(":") for x in subjectdata[trialindex].split(",")]
        for keyValuePair in keysAndValues:
            trialdataraw[keyValuePair[0]] = keyValuePair[1]
        tnum = int(processed[0][trialindex].replace('Answer.q', ''))
        dict[subjname][tnum] = trialdataraw
        dict[subjname][tnum]["language"] = language
        dict[subjname][tnum]["workerid"] = subjectdata[find_idx("workerid")]
        
csv=""
for x in header:
    csv = csv + x + ","
csv = csv[:-1] + "\n"

for subj in dict.keys():
    for trial in dict[subj].keys():
        for x in header:
            csv += dict[subj][trial][x] + ","
        csv = csv[:-1] + "\n"    

parsed = open(filename + "-parsed.csv", 'w')
parsed.write(csv)
parsed.close()
