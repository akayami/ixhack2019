class Settings:
  def __init__(self):
    self.locked_words = []
    self.language     = "EN" # EN,FR,RUS,POL, etc...
    self.source       = "ALL" #FLICKER, BING, etc..
    self.layout       = "SLIDE" #SLIDE, STATIC
    self.text         = "TRUE" #TRUE, FALSE
  def parseText(self, text):
    words = text.split(' ')
    for i in range(len(words)-1):
      if "language" in words[i].lower():
        if "english" in words[i+1].lower():
          self.language = "EN"
        elif "french" in words[i+1].lower():
          self.language = "FR"
      elif "lock" in words[i].lower():
        self.locked_words.append(words[i+1].lower)
      elif "unlock" in words[i].lower():
        self.locked_words.clear()
      elif "text" in words[i].lower():
        if "on" in words[i+1].lower():
          self.text = "TRUE"
        elif "off" in words[i+1].lower():
          self.text = "FALSE"
      elif "view" in words[i].lower():
        if "slide" in words[i+1]:
          self.layout = "SLIDE"
        elif "static" in words[i+1]:
          self.layout = "STATIC"
        elif "flick" in words[i+1]:
          self.source = "FLICKER"
        elif "bing" in words[i+1]:
          self.source = "BING"
  def getSettings(self):
    res = {}
    res["locked_words"]=" ".join(self.locked_words)
    res["language"]=self.language
    res["source"]=self.source
    res["layout"]=self.layout
    res["text"]=self.text
    return res